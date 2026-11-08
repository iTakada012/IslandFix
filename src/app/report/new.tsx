import {zodResolver} from '@hookform/resolvers/zod';
import {useRouter} from 'expo-router';
import {observer} from 'mobx-react-lite';
import * as React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {ActivityIndicator, KeyboardAvoidingView, Platform} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {z} from 'zod';
import {CategoryIcon} from '@/components/reports/category-icon';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {AgencyBadge} from '@/components/reports/badges';
import {AppIcon} from '@/components/ui/app-icon';
import {
  Button,
  ControlledInput,
  Image,
  Pressable,
  ScrollView,
  showErrorMessage,
  Text,
  View,
} from '@/components/ui';
import {
  AGENCIES,
  CATEGORIES,
  reverseGeocode,
  routeReport,
  type CategoryId,
  type GeoPoint,
} from '@/lib/reports';
import {getCurrentLocation, pickPhoto} from '@/lib/reports/media';
import {useStores} from '@/stores';

const CATEGORY_IDS = CATEGORIES.map(c => c.id) as [CategoryId, ...CategoryId[]];

const schema = z.object({
  category: z.enum(CATEGORY_IDS, {
    message: 'Choose what kind of problem it is',
  }),
  description: z
    .string({message: 'Please describe the problem'})
    .trim()
    .min(10, 'Please add a bit more detail (at least 10 characters)')
    .max(500, 'Keep it under 500 characters'),
  landmark: z.string().trim().max(80, 'Keep the landmark short').optional(),
});

type FormType = z.infer<typeof schema>;

/** State of the "use my location" flow, so we can show loading and errors. */
type LocationState =
  | {kind: 'idle'}
  | {kind: 'locating'}
  | {kind: 'lookingUp'; point: GeoPoint}
  | {kind: 'done'; point: GeoPoint; address?: string; warning?: string}
  | {kind: 'error'; message: string};

export default observer(function NewReport() {
  const router = useRouter();
  const {user} = useAuth();
  const {reports} = useStores();

  const {control, handleSubmit, watch, formState} = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {description: '', landmark: ''},
  });
  const selectedCategory = watch('category');

  const [photoUri, setPhotoUri] = React.useState<string | undefined>();
  const [photoBusy, setPhotoBusy] = React.useState(false);
  const [loc, setLoc] = React.useState<LocationState>({kind: 'idle'});
  const [submitting, setSubmitting] = React.useState(false);

  const onPickPhoto = async (source: 'camera' | 'library') => {
    try {
      setPhotoBusy(true);
      const uri = await pickPhoto(source);
      if (uri) setPhotoUri(uri);
    } catch (e: any) {
      showErrorMessage(e?.message ?? 'Could not add photo');
    } finally {
      setPhotoBusy(false);
    }
  };

  const onUseLocation = async () => {
    try {
      setLoc({kind: 'locating'});
      const point = await getCurrentLocation();
      setLoc({kind: 'lookingUp', point});
      try {
        // Public API call (OpenStreetMap Nominatim). Failure is not fatal.
        const address = await reverseGeocode(point);
        setLoc({kind: 'done', point, address});
      } catch (e: any) {
        setLoc({kind: 'done', point, warning: e?.message});
      }
    } catch (e: any) {
      setLoc({
        kind: 'error',
        message: e?.message ?? 'Could not get your location',
      });
    }
  };

  const onSubmit = (data: FormType) => {
    if (!user) return;
    setSubmitting(true);
    const point = loc.kind === 'done' ? loc.point : undefined;
    const address = loc.kind === 'done' ? loc.address : undefined;

    const report = reports.addReport(
      {...data, photoUri, location: point, address},
      user,
    );
    const lead = AGENCIES[report.leadAgency].name;
    showMessage({
      message: 'Report sent',
      description: `Your report was sent to ${lead}.`,
      type: 'success',
      duration: 3000,
    });
    setSubmitting(false);
    router.replace(`/report/${report.id}` as any);
  };

  const routing = selectedCategory ? routeReport(selectedCategory) : null;

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <ScrollView
        className="flex-1 bg-neutral-50 dark:bg-black"
        contentContainerStyle={{padding: 16, paddingBottom: 48}}
        keyboardShouldPersistTaps="handled">
        {/* 1. Category */}
        <Text className="mb-2 text-lg font-bold">1. What is the problem?</Text>
        <Controller
          control={control}
          name="category"
          render={({field: {value, onChange}, fieldState}) => (
            <>
              <View
                className="-mx-1 flex-row flex-wrap"
                accessibilityRole="radiogroup">
                {CATEGORIES.map(c => {
                  const active = value === c.id;
                  return (
                    <View key={c.id} className="w-1/3 p-1">
                      <Pressable
                        testID={`category-${c.id}`}
                        onPress={() => onChange(c.id)}
                        accessibilityRole="radio"
                        accessibilityState={{selected: active}}
                        accessibilityLabel={`${c.label}. ${c.hint}`}
                        className={`min-h-[88px] items-center justify-center rounded-xl border-2 p-2 ${
                          active
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                            : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                        }`}>
                        <CategoryIcon category={c.id} size={30} />
                        <Text className="mt-1 text-center text-xs font-semibold">
                          {c.label}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
              {fieldState.error && (
                <Text className="mt-1 text-sm text-danger-600">
                  {fieldState.error.message}
                </Text>
              )}
            </>
          )}
        />

        {/* Routing preview: shows the user who will receive it */}
        {routing && (
          <View
            testID="routing-preview"
            className="mt-3 rounded-xl bg-blue-50 p-3 dark:bg-blue-950"
            accessibilityLiveRegion="polite">
            <Text className="text-sm">
              This will be sent to{' '}
              <Text className="text-sm font-bold">
                {AGENCIES[routing.lead].name}
              </Text>
              {routing.cc.length > 0 ? ', with a copy to:' : '.'}
            </Text>
            <View className="flex-row flex-wrap">
              <AgencyBadge agency={routing.lead} />
              {routing.cc.map(a => (
                <AgencyBadge key={a} agency={a} cc />
              ))}
            </View>
          </View>
        )}

        {/* 2. Details */}
        <Text className="mb-2 mt-6 text-lg font-bold">2. Describe it</Text>
        <ControlledInput
          testID="description-input"
          control={control}
          name="description"
          label="Description"
          placeholder="e.g. Street lamp has been off for 3 nights"
          multiline
          autoCapitalize="sentences"
          style={{minHeight: 96, textAlignVertical: 'top'}}
        />
        <ControlledInput
          testID="landmark-input"
          control={control}
          name="landmark"
          label="Nearby landmark (optional)"
          placeholder="e.g. Behind the island school"
          autoCapitalize="sentences"
        />

        {/* 3. Photo */}
        <Text className="mb-2 mt-6 text-lg font-bold">
          3. Add a photo (optional)
        </Text>
        {photoUri ? (
          <View>
            <Image
              source={{uri: photoUri}}
              className="h-52 w-full rounded-xl"
              contentFit="cover"
              accessibilityLabel="Selected photo"
            />
            <Button
              variant="outline"
              label="Remove photo"
              onPress={() => setPhotoUri(undefined)}
            />
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Button
              testID="take-photo"
              variant="outline"
              label="Camera"
              icon={<AppIcon name="camera-outline" size={20} />}
              className="flex-1"
              loading={photoBusy}
              onPress={() => onPickPhoto('camera')}
            />
            <Button
              testID="choose-photo"
              variant="outline"
              label="Gallery"
              icon={<AppIcon name="image-outline" size={20} />}
              className="flex-1"
              disabled={photoBusy}
              onPress={() => onPickPhoto('library')}
            />
          </View>
        )}

        {/* 4. Location */}
        <Text className="mb-2 mt-6 text-lg font-bold">
          4. Location (optional)
        </Text>
        <LocationBox
          state={loc}
          onUseLocation={onUseLocation}
          onClear={() => setLoc({kind: 'idle'})}
        />

        <Button
          testID="submit-report"
          label="Send report"
          size="lg"
          className="mt-8 bg-blue-600 dark:bg-blue-600"
          textClassName="text-white dark:text-white"
          loading={submitting}
          disabled={loc.kind === 'locating' || loc.kind === 'lookingUp'}
          onPress={handleSubmit(onSubmit, () =>
            showErrorMessage('Please fix the highlighted fields'),
          )}
        />
        {formState.submitCount > 0 && !formState.isValid && (
          <Text className="text-center text-sm text-danger-600">
            Some details are missing above.
          </Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

/** Shows each stage of getting the location: loading, address, or error. */
function LocationBox({
  state,
  onUseLocation,
  onClear,
}: {
  state: LocationState;
  onUseLocation: () => void;
  onClear: () => void;
}) {
  if (state.kind === 'idle' || state.kind === 'error') {
    return (
      <View>
        <Button
          testID="use-location"
          variant="outline"
          label="Use my current location"
          icon={<AppIcon name="crosshairs-gps" size={20} />}
          onPress={onUseLocation}
        />
        {state.kind === 'error' && (
          <Text className="text-sm text-danger-600">{state.message}</Text>
        )}
      </View>
    );
  }

  if (state.kind === 'locating' || state.kind === 'lookingUp') {
    return (
      <View className="flex-row items-center rounded-xl bg-white p-4 dark:bg-neutral-900">
        <ActivityIndicator />
        <Text className="ml-3">
          {state.kind === 'locating'
            ? 'Getting your location…'
            : 'Looking up address…'}
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-xl bg-white p-4 dark:bg-neutral-900">
      <View className="flex-row items-center">
        <AppIcon name="map-marker" size={18} />
        <Text className="ml-1 flex-1 font-semibold">
          {state.address ?? 'Location saved'}
        </Text>
      </View>
      <Text className="text-xs text-neutral-500">
        {state.point.latitude.toFixed(5)}, {state.point.longitude.toFixed(5)}
      </Text>
      {state.warning && (
        <Text className="mt-1 text-xs text-amber-700">
          {state.warning} Coordinates saved.
        </Text>
      )}
      <Pressable onPress={onClear} accessibilityRole="button" className="mt-2">
        <Text className="text-sm text-blue-600 underline">Remove location</Text>
      </Pressable>
    </View>
  );
}
