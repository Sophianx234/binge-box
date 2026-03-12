import { View, Text, ScrollView, Pressable, Image, Switch, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMovieStore, useAuthStore } from '@/store/store'; 
import { useRouter } from 'expo-router';

export type SettingsRowProps = {
  icon: string;
  title: string;
  value?: string; 
  showChevron?: boolean;
  isDestructive?: boolean;
  nav?: '/(tabs)/saved' | '/(tabs)/downloads' | '/movies/favorites';
  onPress?: () => void; 
};

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const savedMovies = useMovieStore((state) => state.savedMovies);
  
  // 1. Grab BOTH the logout function AND the user object from Zustand!
  const { logout, user } = useAuthStore((state) => ({
    logout: state.logout,
    user: state.user
  }));
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to log out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive", 
          onPress: async () => {
            await logout(); 
            router.replace('/(auth)/signin'); 
          }
        }
      ]
    );
  };

  const SettingsRow = ({ icon, title, value, showChevron = true, isDestructive = false, nav, onPress }: SettingsRowProps ) => (
    <Pressable 
      className="flex-row items-center py-4 border-b border-[#1A2235]" 
      onPress={() => {
        if (onPress) onPress();
        else if (nav) router.push(nav);
      }}
    >
      <View className={`w-8 h-8 rounded-full items-center justify-center mr-4 ${isDestructive ? 'bg-red-500/10' : 'bg-[#1A2235]'}`}>
        <Ionicons name={icon as any} size={18} color={isDestructive ? '#EF4444' : '#00E5FF'} />
      </View>
      <Text className={`flex-1 font-medium text-base ${isDestructive ? 'text-red-500' : 'text-primaryText'}`}>
        {title}
      </Text>
      {value && <Text className="text-[#8899B6] mr-2">{value}</Text>}
      {showChevron && <Ionicons name="chevron-forward" size={18} color="#8899B6" className="opacity-50" />}
    </Pressable>
  );

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        
        {/* --- HEADER: USER INFO --- */}
        <View className="items-center mt-6 mb-8">
          <View className="relative">
            <Image 
              // 2. You can even make the avatar dynamic later if your backend supports it!
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=11' }} 
              className="w-24 h-24 rounded-full border-2 border-[#00E5FF]"
            />
            <Pressable className="absolute bottom-0 right-0 bg-[#00E5FF] w-8 h-8 rounded-full items-center justify-center border-2 border-background">
              <Ionicons name="pencil" size={14} color="#000000" />
            </Pressable>
          </View>
          
          {/* 3. Display the actual User's Name and Email */}
          <Text className="text-primaryText text-2xl font-bold mt-4 capitalize">
            {user?.name || 'Guest User'}
          </Text>
          <Text className="text-[#8899B6] text-sm mt-1">
            {user?.email || 'No email provided'}
          </Text>
          
          <View className="bg-[#00E5FF]/10 px-3 py-1 rounded-full mt-3">
            <Text className="text-[#00E5FF] text-xs font-bold tracking-widest">PRO MEMBER</Text>
          </View>
        </View>

        {/* --- STATS ROW --- */}
        <View className="flex-row justify-between bg-surface p-4 rounded-2xl mb-8">
          <View className="items-center flex-1 border-r border-[#1A2235]">
            <Text className="text-primaryText font-bold text-xl">128</Text>
            <Text className="text-[#8899B6] text-xs mt-1">Watched</Text>
          </View>
          <View className="items-center flex-1 border-r border-[#1A2235]">
            <Text className="text-primaryText font-bold text-xl">{savedMovies.length}</Text>
            <Text className="text-[#8899B6] text-xs mt-1">My List</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-primaryText font-bold text-xl">12</Text>
            <Text className="text-[#8899B6] text-xs mt-1">Reviews</Text>
          </View>
        </View>

        {/* --- SETTINGS GROUPS --- */}
        <View className="mb-6">
          <Text className="text-primaryText font-bold text-lg mb-2">Content & Activity</Text>
          <View className="bg-surface px-4 rounded-2xl">
            <SettingsRow icon="bookmark" title="My List" nav="/(tabs)/saved" />
            <SettingsRow icon="download" title="Downloads" value="2.4 GB" nav="/(tabs)/downloads" />
            <SettingsRow icon="heart" title="Favorite Genres" value="Anime, Action" showChevron={false} nav="/movies/favorites" />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-primaryText font-bold text-lg mb-2">App Settings</Text>
          <View className="bg-surface px-4 rounded-2xl">
            <SettingsRow icon="person" title="Account Details" />
            <SettingsRow icon="card" title="Subscription" value="Active" />
            
            <View className="flex-row items-center py-4 border-b border-[#1A2235]">
              <View className="w-8 h-8 rounded-full bg-[#1A2235] items-center justify-center mr-4">
                <Ionicons name="notifications" size={18} color="#00E5FF" />
              </View>
              <Text className="flex-1 text-primaryText font-medium text-base">Push Notifications</Text>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#1A2235', true: '#00E5FF' }}
                thumbColor="#FFFFFF"
              />
            </View>
            
            <SettingsRow icon="color-palette" title="App Theme" value="Dark" />
          </View>
        </View>

        {/* --- LOGOUT --- */}
        <View className="mb-12">
          <View className="bg-surface px-4 rounded-2xl">
            <SettingsRow 
              icon="log-out" 
              title="Sign Out" 
              isDestructive={true} 
              showChevron={false} 
              onPress={handleLogout} 
            />
          </View>
        </View>
        <View className='h-20'></View>
      </ScrollView>

    </SafeAreaView>
  );
}