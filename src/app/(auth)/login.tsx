import {useRouter} from 'expo-router';
import React from 'react';

import type {LoginFormProps} from '@/components/login-form';
import {LoginForm} from '@/components/login-form';
import {FocusAwareStatusBar} from '@/components/ui';
import {useAuth} from '@/app/providers/auth/auth-provider';
import {authenticate} from '@/lib/reports';

export default function Login() {
  const router = useRouter();
  const {signIn, setIsFirstTime} = useAuth();

  const onSubmit: LoginFormProps['onSubmit'] = data => {
    const user = authenticate(data.email, data.password);
    if (!user) {
      return 'Incorrect email or password';
    }

    setIsFirstTime(false);
    signIn(user);
    router.replace('/');
    return null;
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} />
    </>
  );
}