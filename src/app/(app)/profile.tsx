import {observer} from 'mobx-react-lite';
import React from 'react';

import {useAuth} from '@/app/providers/auth/auth-provider';
import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import {AGENCIES, countByStatus, reportsForScope} from '@/lib/reports';
import {useStores} from '@/stores';

/** Who is signed in, plus a quick summary of their reports. */
export default observer(function Profile() {
  const {user, signOut} = useAuth();
  const {reports} = useStores();

  if (!user) return null;

  const isCitizen = user.role === 'citizen';
  const mine = reportsForScope(
    reports.reports,
    user,
    isCitizen ? 'mine' : 'assigned',
  );
  const stats = countByStatus(mine);
  const agency = user.agency ? AGENCIES[user.agency] : null;

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-black">
        <View className="items-center px-4 pt-8">
          <View className="size-20 items-center justify-center rounded-full bg-blue-600">
            <Text className="text-3xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text className="mt-3 text-2xl font-bold">{user.name}</Text>
          <Text className="text-neutral-500">
            {isCitizen ? 'Citizen' : `Staff · ${agency?.name}`}
          </Text>
          {agency && (
            <Text className="mt-1 text-center text-sm text-neutral-500">
              {agency.description}
            </Text>
          )}
        </View>

        <Text className="mx-4 mb-2 mt-8 text-xs font-bold uppercase tracking-wide text-neutral-500">
          {isCitizen ? 'My reports' : 'Assigned to my agency'}
        </Text>
        <View className="mx-4 flex-row gap-2">
          <Stat label="Total" value={stats.total} />
          <Stat label="Open" value={stats.open} />
          <Stat label="Resolved" value={stats.resolved} />
        </View>

        <View className="mx-4 mt-10">
          <Button
            testID="logout-button"
            variant="outline"
            label="Sign out"
            onPress={signOut}
          />
          <Text className="mt-2 text-center text-xs text-neutral-500">
            Tip: sign in as STELCO, MWSC or Council staff to respond to reports.
          </Text>
        </View>
      </ScrollView>
    </>
  );
});

const Stat = ({label, value}: {label: string; value: number}) => (
  <View
    className="flex-1 items-center rounded-2xl bg-white py-4 dark:bg-neutral-900"
    accessibilityLabel={`${label}: ${value}`}>
    <Text className="text-3xl font-bold">{value}</Text>
    <Text className="text-sm text-neutral-500">{label}</Text>
  </View>
);
