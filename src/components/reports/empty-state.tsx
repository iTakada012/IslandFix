import React from 'react';

import {Text, View} from '@/components/ui';
import {AppIcon} from '@/components/ui/app-icon';
import type {IconName} from '@/lib/reports';

type Props = {
  icon?: IconName;
  title: string;
  message?: string;
  children?: React.ReactNode;
};

/** Friendly placeholder for empty lists. */
export const EmptyState = ({icon = 'inbox-outline', title, message, children}: Props) => (
  <View className="items-center px-8 py-16">
    <AppIcon name={icon} size={56} color="#a3a3a3" />
    <Text className="mt-3 text-center text-lg font-semibold">{title}</Text>
    {message ? <Text className="mt-1 text-center text-neutral-500">{message}</Text> : null}
    {children}
  </View>
);