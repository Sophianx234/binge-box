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
import Logo from '@/components/Logo';

// 1. Define the Zod Schema for Login
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"), 
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

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
      await setAuth(data.token, data.user);
      router.replace('/'); 
    },
    onError: (error: any) => {
      Alert.alert("Login Failed", error.message);
    }
  });

  // 4. Submit Handlers
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Login", "Google Auth integration coming soon!");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black"
    >
      {/* --- FULLSCREEN LOADING OVERLAY --- */}
      {loginMutation.isPending && (
        <View className="absolute z-50 w-full h-full bg-black/80 justify-center items-center">
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text className="text-[#00E5FF] mt-4 font-bold tracking-widest text-sm">
            AUTHENTICATING
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Header */}
        <View className="mb-12 items-center">
          <Logo  />
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

        {/* Primary Submit Button */}
        <Pressable 
          onPress={handleSubmit(onSubmit)} 
          disabled={loginMutation.isPending}
          className={`mt-8 py-4 rounded-xl items-center gap-2 flex-row justify-center ${
            'bg-[#00E5FF]'
          }`}
        >
          {loginMutation.isPending&&<ActivityIndicator color="#000" />}
          <Text className="text-black font-bold text-lg items-center justify-center flex-row">{loginMutation.isPending ? 'Logging In....' : 'Log In'}</Text>
        </Pressable>

        {/* OR DIVIDER */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-white/20" />
          <Text className="text-white/60 mx-4 font-bold tracking-widest text-xs">OR</Text>
          <View className="flex-1 h-[1px] bg-white/20" />
        </View>

        {/* GOOGLE BUTTON */}
        <Pressable 
          onPress={handleGoogleLogin} 
          disabled={loginMutation.isPending}
          className="bg-white py-4 rounded-xl items-center flex-row justify-center active:bg-gray-200"
        >
          <Ionicons name="logo-google" size={22} color="#000000" />
          <Text className="text-black font-bold text-lg ml-3">Continue with Google</Text>
        </Pressable>

        {/* Navigate to Signup */}
        <View className="flex-row justify-center mt-10">
          <Text className="text-white/60 text-base">Don't have an account? </Text>
          <Link href="/(auth)/signup">
            <Text className="text-[#00E5FF] font-bold text-base">Sign Up</Text>
          </Link>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}