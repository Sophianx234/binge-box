import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { Link, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/store';
import { loginUser } from '@/api/services';

// 1. Define the Zod Schema for Login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"), // We just need to know they typed *something*
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  // 2. Initialize React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  // 3. Setup the React Query Mutation
  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      // Save the token securely to the device using Zustand
      await setToken(data.token);
      
      // Navigate to the main app layout
      router.replace('/'); 
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.message);
    }
  });

  // 4. Submit Handler
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Header */}
        <View className="mb-12 items-center">
          <Ionicons name="film" size={60} color="#00E5FF" />
          <Text className="text-white text-3xl font-bold mt-4 tracking-wider">Welcome Back</Text>
          <Text className="text-white/60 text-base mt-2 text-center">
            Log in to access your saved movies and downloads.
          </Text>
        </View>

        {/* Form Fields */}
        <View className="gap-5">
          
          {/* Email Input */}
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

          {/* Password Input */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#FFFFFF80"
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  }`}
                />
                {errors.password && (
                  <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</Text>
                )}
              </View>
            )}
          />
          
          {/* Forgot Password Link */}
          <Pressable onPress={() => router.push('/(auth)/forgot-password')} className="self-end mt-2">
            <Text className="text-[#00E5FF] font-medium">Forgot Password?</Text>
          </Pressable>
        </View>

        {/* Submit Button */}
        <Pressable 
          onPress={handleSubmit(onSubmit)} 
          disabled={loginMutation.isPending}
          className={`mt-8 py-4 rounded-xl items-center flex-row justify-center ${
            loginMutation.isPending ? 'bg-[#00E5FF]/70' : 'bg-[#00E5FF]'
          }`}
        >
          {loginMutation.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black font-bold text-lg">Log In</Text>
          )}
        </Pressable>

        {/* Navigate to Signup */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-white/60 text-base">Don't have an account? </Text>
          <Link href="/(auth)/signup">
            <Text className="text-[#00E5FF] font-bold text-base">Sign Up</Text>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}