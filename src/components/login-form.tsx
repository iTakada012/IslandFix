import {zodResolver} from '@hookform/resolvers/zod';
import React from 'react';
import type {SubmitHandler} from 'react-hook-form';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, Platform} from 'react-native';
import * as z from 'zod';

import {Button, ControlledInput, ScrollView, Text, View} from '@/components/ui';
import {AGENCIES} from '@/lib/reports';
import {ChoiceChip} from './reports/choice-chip';

/** "Who are you?" options. Staff options map to an agency. */
export const ACCOUNT_TYPES = [
  {
    value: 'citizen',
    label: 'Citizen',
    icon: '🙋',
    hint: 'Report problems on the island',
  },
  {
    value: 'council',
    label: AGENCIES.council.name,
    icon: '🏛️',
    hint: 'Council staff',
  },
  {
    value: 'stelco',
    label: AGENCIES.stelco.name,
    icon: '⚡',
    hint: 'Electricity staff',
  },
  {
    value: 'mwsc',
    label: AGENCIES.mwsc.name,
    icon: '💧',
    hint: 'Water & sewerage staff',
  },
] as const;

const schema = z.object({
  name: z
    .string({message: 'Please enter your name'})
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(40, 'Name is too long'),
  accountType: z.enum(['citizen', 'council', 'stelco', 'mwsc'], {
    message: 'Choose an account type',
  }),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: SubmitHandler<FormType>;
};

export const LoginForm = ({onSubmit = () => {}}: LoginFormProps) => {
  const {handleSubmit, control} = useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {name: '', accountType: 'citizen'},
  });

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={10}>
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center p-5">
          <Text
            testID="form-title"
            className="pb-2 text-center text-4xl font-bold">
            Sign in
          </Text>
          <Text className="mb-6 text-center text-neutral-500">
            Demo login: no password needed. Choose a role to see the app from
            that side.
          </Text>

          <ControlledInput
            testID="name-input"
            control={control}
            name="name"
            label="Your name"
            placeholder="e.g. Aisha"
            autoCapitalize="words"
            accessibilityLabel="Your name"
          />

          <Text className="mb-2 mt-3 text-lg">I am using the app as</Text>
          <Controller
            control={control}
            name="accountType"
            render={({field: {value, onChange}, fieldState}) => (
              <View accessibilityRole="radiogroup">
                {ACCOUNT_TYPES.map(t => (
                  <ChoiceChip
                    key={t.value}
                    testID={`account-${t.value}`}
                    icon={t.icon}
                    label={t.label}
                    hint={t.hint}
                    selected={value === t.value}
                    onPress={() => onChange(t.value)}
                  />
                ))}
                {fieldState.error && (
                  <Text className="text-sm text-danger-600">
                    {fieldState.error.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Button
            testID="login-button"
            label="Continue"
            size="lg"
            className="mt-6"
            onPress={handleSubmit(onSubmit)}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
