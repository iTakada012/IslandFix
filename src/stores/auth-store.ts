import {makeAutoObservable} from 'mobx';
import {makePersistable, hydrateStore} from 'mobx-persist-store';

import type {AppUser} from '@/lib/reports';

export type AuthStatus = 'idle' | 'signOut' | 'signIn';

/**
 * AuthStore keeps track of who is using the app.
 * There is no real backend: "signing in" stores the chosen name and role
 * locally (persisted with AsyncStorage) so the session survives restarts.
 */
export class AuthStore {
  user: AppUser | null = null;
  status: AuthStatus = 'idle';
  isFirstTime = true;

  constructor() {
    makeAutoObservable(this);

    makePersistable(this, {
      name: 'AuthStore',
      properties: ['user', 'status', 'isFirstTime'],
    });
  }

  signIn(user: AppUser) {
    this.user = user;
    this.status = 'signIn';
  }

  setIsFirstTime(value: boolean) {
    this.isFirstTime = value;
  }

  /** Sign out but keep reports and settings. Onboarding is not shown again. */
  signOut() {
    this.user = null;
    this.status = 'signOut';
  }

  hydrate = async (): Promise<void> => {
    await hydrateStore(this);
  };
}
