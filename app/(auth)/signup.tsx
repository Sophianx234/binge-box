import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/store';
import { registerUser } from '@/api/services';

// 1. Define the Zod Schema (Matches your backend requirements)
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please use YYYY-MM-DD format"),
});

// Infer the TypeScript type directly from the Zod schema
type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  // 2. Initialize React Hook Form
  const { control, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      birthdate: '',
    }
  });

  // 3. Setup the React Query Mutation
  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      // Save the token securely to the device
      await setToken(data.token);
      Alert.alert("Success", "Account created successfully!");
      // Navigate to the main app layout
      router.replace('/'); 
    },
    onError: (error: any) => {
      Alert.alert("Registration Failed", error.message);
    }
  });

  // 4. Submit Handler
  const onSubmit = (data: SignupFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        {/* Header */}
        <View className="mb-10 items-center">
          <Ionicons name="film-outline" size={60} color="#FFFFFF" />
          <Text className="text-white text-3xl font-bold mt-4 tracking-wider">Join Binge Box</Text>
          <Text className="text-white/60 text-base mt-2">Create an account to save your favorites.</Text>
        </View>

        {/* Form Fields */}
        <View className="gap-5">
          
          {/* Name Input */}
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#FFFFFF80" // White at 50% opacity
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.name ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.name && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.name.message}</Text>}
              </View>
            )}
          />

          {/* Username Input */}
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#FFFFFF80"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.username ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.username && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.username.message}</Text>}
              </View>
            )}
          />

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
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.email ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.email && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.email.message}</Text>}
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
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.password ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.password && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.password.message}</Text>}
              </View>
            )}
          />

          {/* Birthdate Input */}
          <Controller
            control={control}
            name="birthdate"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  placeholder="Birthdate (YYYY-MM-DD)"
                  placeholderTextColor="#FFFFFF80"
                  keyboardType="numbers-and-punctuation"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.birthdate ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.birthdate && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.birthdate.message}</Text>}
              </View>
            )}
          />
        </View>

        {/* Submit Button */}
        <Pressable 
          onPress={handleSubmit(onSubmit)} 
          disabled={registerMutation.isPending}
          className="bg-[#00E5FF] mt-8 py-4 rounded-xl items-center flex-row justify-center"
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text className="text-black font-bold text-lg">Create Account</Text>
          )}
        </Pressable>

        {/* Navigate to Login */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-white/60 text-base">Already have an account? </Text>
          <Pressable onPress={() => router.push('/login')}>
            <Text className="text-[#00E5FF] font-bold text-base">Log In</Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}