import React from 'react';

import {Pressable, Text, View} from '@/components/ui';

type Props = {
  label: string;
  icon?: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

/** A large, accessible selectable row (used for role and option pickers). */
export const ChoiceChip = ({
  label,
  icon,
  hint,
  selected,
  onPress,
  testID,
}: Props) => (
  <Pressable
    testID={testID}
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{selected}}
    accessibilityLabel={hint ? `${label}. ${hint}` : label}
    className={`mb-2 min-h-[56px] flex-row items-center rounded-xl border-2 px-4 py-3 ${
      selected
        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
    }`}>
    {icon ? <Text className="mr-3 text-2xl">{icon}</Text> : null}
    <View className="flex-1">
      <Text className="text-base font-semibold">{label}</Text>
      {hint ? <Text className="text-sm text-neutral-500">{hint}</Text> : null}
    </View>
    <View
      className={`size-5 items-center justify-center rounded-full border-2 ${
        selected ? 'border-blue-600' : 'border-neutral-400'
      }`}>
      {selected ? <View className="size-2.5 rounded-full bg-blue-600" /> : null}
    </View>
  </Pressable>
);
