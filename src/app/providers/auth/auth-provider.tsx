import React, {createContext, useContext} from 'react';
import {observer} from 'mobx-react-lite';

import type {AppUser} from '@/lib/reports';
import {stores, AuthStatus} from '@/stores';

interface AuthState {
  user: AppUser | null;
  status: AuthStatus;
  isFirstTime: boolean;
  signIn: (user: AppUser) => void;
  signOut: () => void;
  setIsFirstTime: (value: boolean) => void;
}

const AuthContext = createContext<AuthState | null>(null);

/** Exposes the AuthStore through React context (used by screens and layouts). */
export const AuthProvider = observer(
  ({children}: {children: React.ReactNode}) => {
    const value: AuthState = {
      user: stores.auth.user,
      status: stores.auth.status,
      isFirstTime: stores.auth.isFirstTime,
      signIn: user => stores.auth.signIn(user),
      signOut: () => stores.auth.signOut(),
      setIsFirstTime: value => stores.auth.setIsFirstTime(value),
    };

    return (
      <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
  },
);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
