import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import {useForm} from 'react-hook-form';
import {KeyboardAvoidingView, Platform} from 'react-native';
import * as z from 'zod';

import {Button, ControlledInput, Pressable, ScrollView, Text, View} from '@/components/ui';
import {AGENCIES, DEMO_ACCOUNTS} from '@/lib/reports';

const schema = z.object({
  email: z
    .string({message: 'Email is required'})
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string({message: 'Password is required'}).min(1, 'Password is required'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  /** Return an error message to show, or null if sign in worked. */
  onSubmit: (data: FormType) => string | null;
};

export const LoginForm = ({onSubmit}: LoginFormProps) => {
  const {handleSubmit, control, setValue, setError, clearErrors} = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {email: '', password: ''},
  });

  const submit = (data: FormType) => {
    const error = onSubmit(data);
    if (error) {
      setError('password', {message: error});
    }
  };

  // Tapping a demo account fills in its email and password
  const fillDemo = (email: string, password: string) => {
    clearErrors();
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center p-5">
          <Text testID="form-title" className="pb-2 text-center text-4xl font-bold">
            Sign in
          </Text>
          <Text className="mb-6 text-center text-neutral-500">
            Use your IslandFix account, or tap a demo account below.
          </Text>

          <ControlledInput
            testID="email-input"
            control={control}
            name="email"
            label="Email"
            placeholder="you@islandfix.mv"
            keyboardType="email-address"
            autoComplete="email"
            accessibilityLabel="Email"
          />
          <ControlledInput
            testID="password-input"
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            accessibilityLabel="Password"
          />

          <Button
            testID="login-button"
            label="Sign in"
            size="lg"
            className="mt-4"
            onPress={handleSubmit(submit)}
          />

          {/* Demo accounts: makes testing and marking easier */}
          <Text className="mb-2 mt-8 text-xs font-bold uppercase tracking-wide text-neutral-500">
            Demo accounts
          </Text>
          {DEMO_ACCOUNTS.map(a => (
            <Pressable
              key={a.id}
              testID={`demo-${a.id}`}
              onPress={() => fillDemo(a.email, a.password)}
              accessibilityRole="button"
              accessibilityLabel={`Use demo account ${a.name}`}
              className="mb-2 flex-row items-center rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
              <View className="flex-1">
                <Text className="font-semibold">
                  {a.name} · {a.role === 'citizen' ? 'Citizen' : AGENCIES[a.agency!].shortName}
                </Text>
                <Text className="text-xs text-neutral-500">
                  {a.email} / {a.password}
                </Text>
              </View>
              <Text className="text-sm text-blue-600">Use</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};