import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  size?: 'md' | 'sm';
};

/**
 * iOS-style segmented control used for list tabs and status filters.
 *
 * Note: the selected look (background, shadow, text colour) is set with the
 * `style` prop, NOT by switching Tailwind classes. On Android/iOS, NativeWind
 * crashes with "Couldn't find a navigation context" when classes like
 * `shadow-sm` or `dark:` are added to a component after it first renders.
 */
export function Segmented<T extends string>({ options, value, onChange, size = 'md' }: Props<T>) {
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800"
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`segment-${o.value}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center justify-center rounded-lg ${
              size === 'sm' ? 'py-1.5' : 'py-2.5'
            }`}
            style={active ? [activeShadow, { backgroundColor: dark ? '#525252' : '#ffffff' }] : null}
          >
            <Text
              className={`font-semibold ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
              style={{ color: active ? (dark ? '#ffffff' : '#000000') : dark ? '#a3a3a3' : '#737373' }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const activeShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 2,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
};