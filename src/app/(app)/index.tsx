import {Link} from 'expo-router';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {FlatList} from 'react-native';

import {useAuth} from '@/app/providers/auth/auth-provider';
import {EmptyState} from '@/components/reports/empty-state';
import {ReportCard} from '@/components/reports/report-card';
import {Segmented} from '@/components/reports/segmented';
import {Button, FocusAwareStatusBar, View} from '@/components/ui';
import {
  filterByStatus,
  reportsForScope,
  sortNewestFirst,
  type ReportScope,
  type StatusFilter,
} from '@/lib/reports';
import {useStores} from '@/stores';

const CITIZEN_SCOPES: {value: ReportScope; label: string}[] = [
  {value: 'mine', label: 'My reports'},
  {value: 'community', label: 'Community'},
];

const STAFF_SCOPES: {value: ReportScope; label: string}[] = [
  {value: 'assigned', label: 'Assigned to us'},
  {value: 'cc', label: 'For info (CC)'},
];

const STATUS_FILTERS: {value: StatusFilter; label: string}[] = [
  {value: 'open', label: 'Open'},
  {value: 'closed', label: 'Closed'},
  {value: 'all', label: 'All'},
];

/**
 * Home tab.
 * Citizens: their own reports + everything reported on the island.
 * Staff: reports their agency leads on + ones they are copied in on.
 */
export default observer(function ReportsScreen() {
  const {user} = useAuth();
  const {reports} = useStores();
  const isCitizen = user?.role === 'citizen';

  const [scope, setScope] = React.useState<ReportScope>(
    isCitizen ? 'mine' : 'assigned',
  );
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('open');

  // Reset the segment when the role changes (e.g. sign out and in as staff)
  React.useEffect(() => {
    setScope(isCitizen ? 'mine' : 'assigned');
  }, [isCitizen]);

  const data = sortNewestFirst(
    filterByStatus(reportsForScope(reports.reports, user, scope), statusFilter),
  );

  return (
    <View className="flex-1 bg-neutral-50 dark:bg-black">
      <FocusAwareStatusBar />
      <View className="gap-2 px-4 pb-2 pt-3">
        <Segmented
          options={isCitizen ? CITIZEN_SCOPES : STAFF_SCOPES}
          value={scope}
          onChange={setScope}
        />
        <Segmented
          options={STATUS_FILTERS}
          value={statusFilter}
          onChange={setStatusFilter}
          size="sm"
        />
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({item}) => <ReportCard report={item} />}
        contentContainerStyle={{paddingBottom: 96}}
        ListEmptyComponent={
          <EmptyState
            icon={statusFilter === 'open' ? 'check-circle-outline' : 'inbox-outline'}
            title={
              scope === 'mine'
                ? 'No reports here yet'
                : statusFilter === 'open'
                  ? 'Nothing open right now'
                  : 'No reports found'
            }
            message={
              scope === 'mine'
                ? 'Spotted a broken street light or a water leak? Let the right people know.'
                : 'Try a different filter above.'
            }>
            {scope === 'mine' && (
              <Link href={'/report/new' as any} asChild>
                <Button
                  label="Report a problem"
                  className="mt-4 px-6"
                  fullWidth={false}
                />
              </Link>
            )}
          </EmptyState>
        }
      />

      {/* Floating action button for the main task */}
      {isCitizen && data.length > 0 && (
        <View className="absolute bottom-6 right-5">
          <Link href={'/report/new' as any} asChild>
            <Button
              testID="new-report-fab"
              label="+  Report a problem"
              size="lg"
              fullWidth={false}
              className="rounded-full bg-blue-600 shadow-lg dark:bg-blue-600"
              textClassName="text-white dark:text-white"
              accessibilityLabel="Report a problem"
            />
          </Link>
        </View>
      )}
    </View>
  );
});
