import React from 'react';

import {Text, View} from '@/components/ui';

type Props = {
  icon?: string;
  title: string;
  message?: string;
  children?: React.ReactNode;
};

/** Friendly placeholder for empty lists. */
export const EmptyState = ({icon = '📭', title, message, children}: Props) => (
  <View className="items-center px-8 py-16">
    <Text className="text-5xl">{icon}</Text>
    <Text className="mt-3 text-center text-lg font-semibold">{title}</Text>
    {message ? (
      <Text className="mt-1 text-center text-neutral-500">{message}</Text>
    ) : null}
    {children}
  </View>
);
