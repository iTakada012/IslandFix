import React from 'react';
import {Alert, Platform} from 'react-native';
import {observer} from 'mobx-react-lite';
import {showMessage} from 'react-native-flash-message';

import {Item} from '@/components/settings/item';
import {ItemsContainer} from '@/components/settings/items-container';
import {LanguageItem} from '@/components/settings/language-item';
import {ThemeItem} from '@/components/settings/theme-item';
import {FocusAwareStatusBar, ScrollView, Text, View} from '@/components/ui';
import {translate} from '@/lib';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {useStores} from '@/stores';

export default observer(function Settings() {
  const {signOut} = useAuth();
  const {reports} = useStores();

  const resetData = () => {
    const doReset = () => {
      reports.resetDemoData();
      showMessage({message: 'Demo data restored', type: 'success'});
    };
    if (Platform.OS === 'web') {
      doReset();
      return;
    }
    Alert.alert(
      'Reset demo data?',
      'All reports on this device will be replaced with the sample reports.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Reset', style: 'destructive', onPress: doReset},
      ],
    );
  };
  const clearAll = () => {
    const doClear = () => {
      reports.clearAll();
      showMessage({message: 'All reports deleted', type: 'success'});
    };
    if (Platform.OS === 'web') {
      doClear();
      return;
    }
    Alert.alert(
      'Delete all reports?',
      'Every report on this device will be removed. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Delete all', style: 'destructive', onPress: doClear},
      ],
    );
  };

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 px-4 pt-16">
          <Text className="text-xl font-bold">
            {translate('settings.title')}
          </Text>

          <ItemsContainer title="settings.generale">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about">
            <Item text="settings.app_name" value="IslandFix" />
            <Item text="settings.version" value="1.0.0" />
            <Item
              text="settings.reports_saved"
              value={String(reports.reports.length)}
            />
          </ItemsContainer>

          <ItemsContainer title="settings.data">
            <Item text="settings.reset_demo" onPress={resetData} />
            <Item text="settings.clear_all" onPress={clearAll} />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item text="settings.logout" onPress={() => signOut()} />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
});
