import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/store';
import { uploadAvatarToServer } from '@/api/services';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

export default function AccountDetailsScreen() {
  const router = useRouter();
  const { user, token, updateUser } = useAuthStore();

  // --- FORM STATE ---
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');

  // --- DATE STATE ---
  const [date, setDate] = useState(user?.birthdate ? new Date(user.birthdate) : new Date());
  const [showPicker, setShowPicker] = useState(false);

  // --- UI STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 1. Handle Avatar Change
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Denied', 'We need access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUploadingImage(true);
      try {
        const updatedUser = await uploadAvatarToServer(token as string, result.assets[0].uri);
        await updateUser(updatedUser);
      } catch (error) {
        Alert.alert('Error', 'Failed to upload image.');
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  // 2. Handle Date Picker
  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios'); // iOS stays open, Android closes
    if (selectedDate) setDate(selectedDate);
  };

  // 3. Handle Profile Save
  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and Username are required.');
      return;
    }

    setIsSaving(true);
    try {
      // Logic for PUT /api/users/profile will go here
      // For now, updating local state:
      if (user) {
        await updateUser({ ...user, name, username, email, bio, birthdate: date.toISOString() });
      }
      Alert.alert('Success', 'Profile updated!');
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* keyboardVerticalOffset helps on iOS to keep inputs above the tab bar area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        className="flex-1">
        <View className="flex-row items-center border-b border-[#1A2235] px-5 pb-4 pt-4">
          <Pressable onPress={() => router.back()} className="rounded-full bg-[#1A2235] p-2">
            <Ionicons name="chevron-back" size={24} color="#F8F9FA" />
          </Pressable>
          <Text className="ml-4 text-xl font-bold text-white">Edit Profile</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 40 }}>
          {/* AVATAR SECTION */}
          <View className="my-8 items-center">
            <Pressable onPress={handlePickImage} className="relative">
              <Image
                source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=11' }}
                className={`h-28 w-28 rounded-full border-4 border-[#00E5FF] ${isUploadingImage ? 'opacity-40' : 'opacity-100'}`}
              />
              <View className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-[#00E5FF] p-2">
                <Ionicons name="camera" size={18} color="black" />
              </View>
              {isUploadingImage && (
                <ActivityIndicator className="absolute top-10" color="#00E5FF" />
              )}
            </Pressable>
          </View>

          {/* NAME INPUT */}
          <View className="mb-5">
            <Text className="mb-2 text-xs font-bold uppercase text-[#8899B6]">Display Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="h-14 rounded-2xl border border-[#1A2235] bg-surface px-4 text-base text-white focus:border-[#00E5FF]"
              placeholderTextColor="#4B5563"
            />
          </View>

          {/* USERNAME INPUT */}
          <View className="mb-5">
            <Text className="mb-2 text-xs font-bold uppercase text-[#8899B6]">Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="h-14 rounded-2xl border border-[#1A2235] bg-surface px-4 text-base text-white focus:border-[#00E5FF]"
            />
          </View>

          {/* DATE PICKER */}
          {/* DATE PICKER */}
          <View className="mb-5">
            <Text className="mb-2 text-xs font-bold uppercase text-[#8899B6]">Birthdate</Text>
            <Pressable
              onPress={() => setShowPicker(true)}
              className="h-14 flex-row items-center justify-between rounded-2xl border border-[#1A2235] bg-surface px-4">
              <Text className="text-base text-white">{date.toDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#00E5FF" />
            </Pressable>

            {showPicker && (
              <View className="mt-2 overflow-hidden rounded-3xl bg-white shadow-xl">
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  themeVariant="light"
                  textColor="black"
                />
                
                {Platform.OS === 'ios' && (
                  <Pressable 
                    onPress={() => setShowPicker(false)}
                    className="items-center border-t border-gray-200 bg-gray-100 py-3"
                  >
                    <Text className="text-base font-bold text-[#00E5FF]">Done</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {/* BIO INPUT */}
          <View className="mb-8">
            <Text className="mb-2 text-xs font-bold uppercase text-[#8899B6]">Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="min-h-[100px] rounded-2xl border border-[#1A2235] bg-surface p-4 text-base text-white focus:border-[#00E5FF]"
              placeholder="Tell us about yourself..."
              placeholderTextColor="#4B5563"
            />
          </View>

          {/* SAVE BUTTON */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving || isUploadingImage}
            className={`h-14 flex-row items-center justify-center rounded-2xl ${isSaving ? 'bg-[#00E5FF]/50' : 'bg-[#00E5FF]'}`}>
            {isSaving ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text className="text-lg font-bold">Save Changes</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
