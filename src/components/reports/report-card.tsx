import {Link} from 'expo-router';
import React from 'react';

import {Image, Pressable, Text, View} from '@/components/ui';
import {getCategory, timeAgo, type Report} from '@/lib/reports';
import {AgencyBadge, StatusBadge} from './badges';
import {CategoryIcon} from './category-icon';

/** Summary card used in the reports list. Tapping opens the details screen. */
export const ReportCard = ({report}: {report: Report}) => {
  const category = getCategory(report.category);

  return (
    <Link href={`/report/${report.id}` as any} asChild>
      <Pressable
        testID={`report-card-${report.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${category.label} report, ${report.landmark ?? ''}. Opens details`}
        className="mx-4 my-1.5 flex-row overflow-hidden rounded-2xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
        {report.photoUri ? (
          <Image
            source={{uri: report.photoUri}}
            className="mr-3 size-20 rounded-xl"
            contentFit="cover"
          />
        ) : (
          <View className="mr-3 size-20 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800">
            <CategoryIcon category={report.category} size={36} />
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 pr-2 text-base font-bold" numberOfLines={1}>
              {category.label}
            </Text>
            <StatusBadge status={report.status} />
          </View>
          <Text
            className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-300"
            numberOfLines={2}>
            {report.description}
          </Text>
          <View className="mt-1 flex-row flex-wrap items-center">
            <AgencyBadge agency={report.leadAgency} />
            {report.ccAgencies.map(a => (
              <AgencyBadge key={a} agency={a} cc />
            ))}
            <Text className="mt-1 text-xs text-neutral-500">
              {timeAgo(report.createdAt)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};
