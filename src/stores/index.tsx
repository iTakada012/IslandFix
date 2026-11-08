import React from 'react';

import './_hydration';

import {AuthStore, AuthStatus} from './auth-store';
import {ReportsStore} from './reports-store';
import {UILanguageStore} from './ui-language-store';
import {UIThemeStore} from './ui-theme-store';
import {IStore, PVoid} from './types';

// Re-export types
export type {AuthStatus};

// Centralized stores object
class Stores {
  auth = new AuthStore();
  uiLanguage = new UILanguageStore();
  uiTheme = new UIThemeStore();
  reports = new ReportsStore();
}

export const stores = new Stores();

const storeContext = React.createContext<Stores>(stores);
export const StoresProvider = ({children}: any) => (
  <storeContext.Provider value={stores}>{children}</storeContext.Provider>
);

export const useStores = (): Stores => React.useContext(storeContext);

export const hydrateStores = async (): PVoid => {
  for (const key in stores) {
    if (Object.prototype.hasOwnProperty.call(stores, key)) {
      const s = (stores as any)[key] as IStore;

      if (s.hydrate) {
        await s.hydrate();
      }
    }
  }
};
