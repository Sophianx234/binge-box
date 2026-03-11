import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset } from '@/api/services';

// 1. Zod Schema (Just the email!)
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // 2. React Hook Form Setup
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  // 3. React Query Mutation
  const resetMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => requestPasswordReset(data.email),
    onSuccess: (data) => {
      // Show the success message we sent from the backend
      Alert.alert(
        "Check your inbox", 
        data.message || "If an account exists, a reset link has been sent.",
        [{ text: "Back to Login", onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message);
    }
  });

  // 4. Submit Handler
  const onSubmit = (data: ForgotPasswordFormData) => {
    resetMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black px-6 justify-center"
    >
      {/* Back Button */}
      <Pressable onPress={() => router.back()} className="absolute top-12 left-5 p-2 bg-white/10 rounded-full">
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
      </Pressable>

      <View className="mb-10 items-center mt-12">
        <View className="bg-white/10 p-5 rounded-full mb-6">
          <Ionicons name="lock-closed-outline" size={50} color="#00E5FF" />
        </View>
        <Text className="text-white text-3xl font-bold tracking-wider text-center">Reset Password</Text>
        <Text className="text-white/60 text-base mt-3 text-center leading-6">
          Enter the email associated with your account and we'll send you a link to reset your password.
        </Text>
      </View>

      {/* Email Input */}
      <View className="gap-5">
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#FFFFFF80"
                autoCapitalize="none"
                keyboardType="email-address"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${
                  errors.email ? 'border-red-500' : 'border-white/20'
                }`}
              />
              {errors.email && (
                <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</Text>
              )}
            </View>
          )}
        />
      </View>

      {/* Submit Button */}
      <Pressable 
        onPress={handleSubmit(onSubmit)} 
        disabled={resetMutation.isPending}
        className={`mt-8 py-4 rounded-xl items-center flex-row justify-center ${
          resetMutation.isPending ? 'bg-[#00E5FF]/70' : 'bg-[#00E5FF]'
        }`}
      >
        {resetMutation.isPending ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text className="text-black font-bold text-lg">Send Reset Link</Text>
        )}
      </Pressable>

    </KeyboardAvoidingView>
  );
}