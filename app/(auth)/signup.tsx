import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // <-- Imported Date Picker
import { useAuthStore } from '@/store/store';
import { registerUser } from '@/api/services';
import Logo from '@/components/Logo';

// 1. Zod Schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  birthdate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please select your birthdate"), // Kept the regex for backend safety!
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignUpScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  // --- NEW: Date Picker State ---
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1)); // Default starts at Jan 1, 2000

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

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      await setAuth(data.token, data.user);
      Alert.alert("Success", "Account created successfully!");
      router.replace('/(tabs)'); 
    },
    onError: (error: any) => {
      Alert.alert("Registration Failed", error.message);
    }
  });

  const onSubmit = (data: SignupFormData) => {
    registerMutation.mutate(data);
  };

  // Helper to format Date object to YYYY-MM-DD for your backend
  const formatLocal = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-black"
    >
      {registerMutation.isPending && (
        <View className="absolute z-50 w-full h-full bg-black/80 justify-center items-center">
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text className="text-[#00E5FF] mt-4 font-bold tracking-widest text-sm">
            CREATING ACCOUNT...
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
        
        <View className="mb-10 items-center">
          <Logo/>
          <Text className="text-white text-3xl font-bold mt-4 tracking-wider">Join Binge Box</Text>
          <Text className="text-white/60 text-base mt-2">Create an account to save your favorites.</Text>
        </View>

        <View className="gap-5">
          
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#FFFFFF80"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={`bg-black text-white px-5 py-4 border rounded-xl text-base ${errors.name ? 'border-red-500' : 'border-white/20'}`}
                />
                {errors.name && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.name.message}</Text>}
              </View>
            )}
          />

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

          {/* --- NEW: INTERACTIVE BIRTHDATE PICKER --- */}
          <Controller
            control={control}
            name="birthdate"
            render={({ field: { onChange, value } }) => (
              <View>
                <Pressable 
                  onPress={() => setShowDatePicker(true)}
                  className={`bg-black flex-row justify-between items-center px-5 py-4 border rounded-xl ${errors.birthdate ? 'border-red-500' : 'border-white/20'}`}
                >
                  <Text className={`text-base ${value ? 'text-white' : 'text-[#FFFFFF80]'}`}>
                    {value ? value : "Birthdate (YYYY-MM-DD)"}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={value ? "#00E5FF" : "#FFFFFF80"} />
                </Pressable>
                {errors.birthdate && <Text className="text-red-500 text-xs mt-1.5 ml-1">{errors.birthdate.message}</Text>}

                {/* The Native Date Picker Component */}
                {showDatePicker && (
                  <DateTimePicker
                    value={value ? new Date(value) : tempDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'} // Spinner looks best on iOS dark mode
                    maximumDate={new Date()} // Can't be born in the future!
                    onChange={(event, selectedDate) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false); // Android closes automatically
                      }
                      if (selectedDate) {
                        setTempDate(selectedDate);
                        if (event.type === 'set') {
                          onChange(formatLocal(selectedDate)); // Updates React Hook Form safely
                        }
                      }
                    }}
                  />
                )}
                
                {/* iOS Done Button (Because iOS spinners don't close automatically) */}
                {Platform.OS === 'ios' && showDatePicker && (
                  <Pressable 
                    onPress={() => {
                      setShowDatePicker(false);
                      onChange(formatLocal(tempDate)); // Save whatever is currently spun
                    }} 
                    className="bg-[#1A2235] py-3 rounded-lg mt-2 items-center"
                  >
                    <Text className="text-[#00E5FF] font-bold">Done</Text>
                  </Pressable>
                )}
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
          <Text className="text-black font-bold text-lg">Create Account</Text>
        </Pressable>

        {/* Navigate to Login */}
        <View className="flex-row justify-center mt-6 mb-10">
          <Text className="text-white/60 text-base">Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/signin')}>
            <Text className="text-[#00E5FF] font-bold text-base">Log In</Text>
          </Pressable>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}