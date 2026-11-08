import {useRouter} from 'expo-router';
import React from 'react';
import {AppIcon} from '@/components/ui/app-icon';
import type {IconName} from '@/lib/reports';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import {useAuth} from '@/app/providers/auth/auth-provider';

const POINTS = [
  {icon: '📸', text: 'Snap a photo of a broken street light, leak or pothole'},
  {icon: '🧭', text: 'We send it to the right agency: Council, STELCO or MWSC'},
  {icon: '🔔', text: 'Follow progress until it is fixed'},
  {icon: '📴', text: 'Works offline: your reports are saved on your phone'},
];

/** Shown once on first launch. */
export default function Onboarding() {
  const {setIsFirstTime} = useAuth();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <FocusAwareStatusBar />
      <View className="flex-1 justify-center px-6">
        <View className="mb-6 size-24 items-center justify-center self-center rounded-3xl bg-blue-600">
          <AppIcon name="island" size={56} color="#ffffff" />
        </View>
        <Text className="text-center text-4xl font-bold">IslandFix</Text>
        <Text className="mb-8 mt-2 text-center text-lg text-neutral-500">
          Report local problems. Get them fixed.
        </Text>

        {POINTS.map(p => (
          <View key={p.icon} className="mb-4 flex-row items-center">
            <View className="mr-4">
              <AppIcon name={p.icon} size={30} />
            </View>
            <Text className="flex-1 text-base">{p.text}</Text>
          </View>
        ))}
      </View>
      <View className="px-6 pb-6">
        <Button
          testID="get-started"
          label="Get started"
          size="lg"
          className="bg-blue-600 dark:bg-blue-600"
          textClassName="text-white dark:text-white"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login' as any);
          }}
        />
      </View>
    </SafeAreaView>
  );
}
