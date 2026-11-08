import '../../global.css';

import {Stack, SplashScreen} from 'expo-router';
import {useEffect, useState} from 'react';
import {hydrateStores} from '@/stores';
import {Providers} from './providers';

// Keep the splash screen visible until saved data is loaded
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load all persisted stores (auth, reports, theme, language) from AsyncStorage
        await hydrateStores();
      } catch (error) {
        console.error('Failed to hydrate stores:', error);
      } finally {
        setIsHydrated(true); // continue even if loading failed
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      const timer = setTimeout(() => {
        SplashScreen.hideAsync();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{headerShown: false}} />
        <Stack.Screen name="(auth)/onboarding" options={{headerShown: false}} />
        <Stack.Screen name="(auth)/login" options={{headerShown: false}} />
        <Stack.Screen
          name="report/new"
          options={{title: 'New report', presentation: 'modal'}}
        />
        <Stack.Screen
          name="report/[id]"
          options={{title: 'Report', headerBackTitle: 'Back'}}
        />
      </Stack>
    </Providers>
  );
}
