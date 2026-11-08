import {useRouter} from 'expo-router';
import React from 'react';

import type {LoginFormProps} from '@/components/login-form';
import {LoginForm} from '@/components/login-form';
import {FocusAwareStatusBar} from '@/components/ui';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {makeUserId, type AppUser} from '@/lib/reports';

export default function Login() {
  const router = useRouter();
  const {signIn, setIsFirstTime} = useAuth();

  const onSubmit: LoginFormProps['onSubmit'] = data => {
    const name = data.name.trim();
    const user: AppUser =
      data.accountType === 'citizen'
        ? {id: makeUserId(name), name, role: 'citizen'}
        : {
            id: makeUserId(name, data.accountType),
            name,
            role: 'staff',
            agency: data.accountType,
          };

    setIsFirstTime(false);
    signIn(user);
    router.replace('/');
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}
