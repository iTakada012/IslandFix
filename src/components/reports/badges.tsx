import React from 'react';

import {Text, View} from '@/components/ui';
import {
  AGENCIES,
  STATUS_META,
  type AgencyId,
  type ReportStatus,
} from '@/lib/reports';

/** Coloured pill showing a report's status. */
export const StatusBadge = ({status}: {status: ReportStatus}) => {
  const meta = STATUS_META[status];
  return (
    <View
      className={`self-start rounded-full px-2.5 py-1 ${meta.badgeClass}`}
      accessibilityLabel={`Status: ${meta.label}`}>
      <Text className={`text-xs font-semibold ${meta.textClass}`}>
        {meta.label}
      </Text>
    </View>
  );
};

/** Small label for an agency, e.g. "→ STELCO" or "CC Council". */
export const AgencyBadge = ({
  agency,
  cc = false,
}: {
  agency: AgencyId;
  cc?: boolean;
}) => {
  const a = AGENCIES[agency];
  return (
    <View
      className="mr-1.5 mt-1 self-start rounded-md border px-2 py-0.5"
      style={{borderColor: a.color}}
      accessibilityLabel={cc ? `Copied to ${a.name}` : `Assigned to ${a.name}`}>
      <Text className="text-xs font-semibold" style={{color: a.color}}>
        {cc ? `CC ${a.shortName}` : `→ ${a.shortName}`}
      </Text>
    </View>
  );
};
