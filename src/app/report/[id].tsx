import {Stack, useLocalSearchParams, useRouter} from 'expo-router';
import {observer} from 'mobx-react-lite';
import * as React from 'react';
import {Alert, Linking, Platform} from 'react-native';
import {showMessage} from 'react-native-flash-message';
import {CategoryIcon} from '@/components/reports/category-icon';
import {AppIcon} from '@/components/ui/app-icon';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {AgencyBadge, StatusBadge} from '@/components/reports/badges';
import {EmptyState} from '@/components/reports/empty-state';
import {
  Button,
  FocusAwareStatusBar,
  Image,
  Input,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {
  AGENCIES,
  STATUS_META,
  canDelete,
  canUpdateStatus,
  getCategory,
  nextStatuses,
  type ReportStatus,
} from '@/lib/reports';
import {useStores} from '@/stores';

/** Full details of one report, its status timeline, and staff actions. */
export default observer(function ReportDetails() {
  const {id} = useLocalSearchParams<{id: string}>();
  const router = useRouter();
  const {user} = useAuth();
  const {reports} = useStores();
  const [note, setNote] = React.useState('');

  const report = id ? reports.getById(id) : undefined;

  if (!report) {
    return (
      <>
        <Stack.Screen options={{title: 'Report'}} />
        <EmptyState
          icon="magnify"
          title="Report not found"
          message="It may have been withdrawn.">
          <Button
            label="Go back"
            className="mt-4 px-6"
            fullWidth={false}
            onPress={() => router.back()}
          />
        </EmptyState>
      </>
    );
  }

  const category = getCategory(report.category);
  const staffCanUpdate = canUpdateStatus(user, report);
  const citizenCanDelete = canDelete(user, report);
  const isCcOnly =
    user?.role === 'staff' &&
    !!user.agency &&
    report.ccAgencies.includes(user.agency);

  const changeStatus = (status: ReportStatus) => {
    if (!user) return;
    const ok = reports.updateStatus(report.id, status, user, note);
    if (ok) {
      setNote('');
      showMessage({
        message: `Marked as ${STATUS_META[status].label}`,
        type: 'success',
      });
    } else {
      showMessage({
        message: 'That status change is not allowed',
        type: 'danger',
      });
    }
  };

  const confirmReject = () => {
    const doReject = () => changeStatus('rejected');
    if (Platform.OS === 'web') {
      doReject();
      return;
    }
    Alert.alert(
      'Reject report?',
      'The citizen will see this report as rejected.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reject', style: 'destructive', onPress: doReject},
      ],
    );
  };

  const confirmDelete = () => {
    const doDelete = () => {
      reports.removeReport(report.id);
      showMessage({message: 'Report withdrawn', type: 'info'});
      router.back();
    };
    if (Platform.OS === 'web') {
      doDelete();
      return;
    }
    Alert.alert('Withdraw this report?', 'This cannot be undone.', [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Withdraw', style: 'destructive', onPress: doDelete},
    ]);
  };

  const openInMaps = () => {
    if (!report.location) return;
    const {latitude, longitude} = report.location;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}`,
      default: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`,
    });
    Linking.openURL(url).catch(() =>
      showMessage({message: 'Could not open maps', type: 'danger'}),
    );
  };

  return (
    <>
      <Stack.Screen options={{title: category.label}} />
      <FocusAwareStatusBar />
      <ScrollView
        className="flex-1 bg-neutral-50 dark:bg-black"
        contentContainerStyle={{padding: 16, paddingBottom: 48}}>
        {report.photoUri ? (
          <Image
            source={{uri: report.photoUri}}
            className="mb-4 h-60 w-full rounded-2xl"
            contentFit="cover"
            accessibilityLabel="Photo of the problem"
          />
        ) : null}

        {/* Header */}
        <View className="flex-row items-center">
          <View className="mr-2"><CategoryIcon category={report.category} size={30} /></View>
          <Text className="flex-1 text-2xl font-bold">{category.label}</Text>
          <StatusBadge status={report.status} />
        </View>
        <Text className="mt-3 text-base leading-6">{report.description}</Text>

        {/* Where */}
        <Section title="Where">
          {report.landmark ? (
            <View className="flex-row items-center">
              <AppIcon name="tag-outline" size={18} color="#737373" />
              <Text className="ml-2">{report.landmark}</Text>
            </View>
          ) : null}
          {report.address ? (
            <View className="mt-1 flex-row items-center">
              <AppIcon name="map-marker-outline" size={18} color="#737373" />
              <Text className="ml-2 flex-1">{report.address}</Text>
            </View>
          ) : null}
          {report.location ? (
            <Button
              variant="outline"
              size="sm"
              label="Open in Maps"
              className="mt-2"
              onPress={openInMaps}
            />
          ) : null}
          {!report.landmark && !report.address && !report.location ? (
            <Text className="text-neutral-500">No location given</Text>
          ) : null}
        </Section>

        {/* Who */}
        <Section title="Sent to">
          <View className="flex-row flex-wrap">
            <AgencyBadge agency={report.leadAgency} />
            {report.ccAgencies.map(a => (
              <AgencyBadge key={a} agency={a} cc />
            ))}
          </View>
          <Text className="mt-2 text-sm text-neutral-500">
            Reported by {report.reporterName} ·{' '}
            {new Date(report.createdAt).toLocaleString()}
          </Text>
        </Section>

        {/* Timeline */}
        <Section title="Progress">
          {report.history.map((h, i) => {
            const last = i === report.history.length - 1;
            return (
              <View key={`${h.status}-${h.at}`} className="flex-row">
                <View className="mr-3 items-center">
                  <View
                    className={`mt-1 size-3 rounded-full ${last ? 'bg-blue-600' : 'bg-neutral-400'}`}
                  />
                  {!last && (
                    <View className="w-0.5 flex-1 bg-neutral-300 dark:bg-neutral-700" />
                  )}
                </View>
                <View className="flex-1 pb-4">
                  <Text className="font-semibold">
                    {STATUS_META[h.status].label}
                  </Text>
                  <Text className="text-xs text-neutral-500">
                    {new Date(h.at).toLocaleString()} · {h.by}
                  </Text>
                  {h.note ? (
                    <Text className="mt-1 text-sm">“{h.note}”</Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </Section>

        {/* Staff actions (lead agency only) */}
        {staffCanUpdate && (
          <Section
            title={`Update status (${AGENCIES[report.leadAgency].shortName})`}>
            <Input
              testID="status-note"
              label="Note for the citizen (optional)"
              placeholder="e.g. Technician scheduled for tomorrow"
              value={note}
              onChangeText={setNote}
              autoCapitalize="sentences"
            />
            {nextStatuses(report.status)
              .filter(s => s !== 'rejected')
              .map(s => (
                <Button
                  key={s}
                  testID={`status-${s}`}
                  label={`Mark as ${STATUS_META[s].label}`}
                  className="bg-blue-600 dark:bg-blue-600"
                  textClassName="text-white dark:text-white"
                  onPress={() => changeStatus(s)}
                />
              ))}
            <Button
              variant="outline"
              label="Reject report"
              onPress={confirmReject}
            />
          </Section>
        )}

        {isCcOnly && report.leadAgency !== user?.agency && (
          <Text className="mt-4 text-center text-sm text-neutral-500">
            Your agency is copied in for information.{' '}
            {AGENCIES[report.leadAgency].name} is responsible for updating this
            report.
          </Text>
        )}

        {citizenCanDelete && (
          <Button
            testID="withdraw-report"
            variant="destructive"
            label="Withdraw report"
            className="mt-6"
            onPress={confirmDelete}
          />
        )}
      </ScrollView>
    </>
  );
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-5 rounded-2xl bg-white p-4 dark:bg-neutral-900">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
        {title}
      </Text>
      {children}
    </View>
  );
}
