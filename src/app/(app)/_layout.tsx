/* eslint-disable react/no-unstable-nested-components */
import {Link, Redirect, Tabs} from 'expo-router';
import React from 'react';

import {Pressable, Text} from '@/components/ui';
import {
  Feed as FeedIcon,
  Settings as SettingsIcon,
  Home as ProfileIcon,
} from '@/components/ui/icons';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {AGENCIES} from '@/lib/reports';

/**
 * Bottom tab navigator for signed-in users.
 * Guards: first launch -> onboarding, signed out -> login.
 */
export default function TabLayout() {
  const {status, isFirstTime, user} = useAuth();

  if (isFirstTime) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (status !== 'signIn' || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  const isCitizen = user.role === 'citizen';
  const reportsTitle = isCitizen
    ? 'Reports'
    : `${AGENCIES[user.agency ?? 'council'].shortName} inbox`;

  return (
    <Tabs screenOptions={{tabBarActiveTintColor: '#2563EB'}}>
      <Tabs.Screen
        name="index"
        options={{
          title: reportsTitle,
          tabBarLabel: isCitizen ? 'Reports' : 'Inbox',
          tabBarIcon: ({color}) => <FeedIcon color={color} />,
          headerRight: isCitizen ? () => <NewReportLink /> : undefined,
          tabBarButtonTestID: 'reports-tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({color}) => <ProfileIcon color={color} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerShown: false,
          tabBarIcon: ({color}) => <SettingsIcon color={color} />,
          tabBarButtonTestID: 'settings-tab',
        }}
      />
    </Tabs>
  );
}

const NewReportLink = () => (
  <Link href={'/report/new' as any} asChild>
    <Pressable
      testID="new-report-header"
      accessibilityRole="button"
      accessibilityLabel="Create a new report"
      className="mr-3 rounded-full bg-blue-600 px-3 py-1.5">
      <Text className="text-sm font-semibold text-white">+ New</Text>
    </Pressable>
  </Link>
);
