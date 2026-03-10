import { View, Text, ScrollView, Pressable, Image, Switch } from 'react-native';
import React, { ReactNode, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useMovieStore } from '@/store/store';
import { useRouter } from 'expo-router';
export type SettingsRowProps = {
  icon:string,
  title:string,
  value:string,
  showChevron:boolean,
  isDestructive?:boolean,
  nav?:'/(tabs)/saved'   | '/movies/index' | '/movies/favorites'
}
export default function ProfileScreen() {
  // A simple state for a dummy "Dark Mode" or "Notifications" toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const savedMovies = useMovieStore((state) => state.savedMovies);
  const router = useRouter();

  // A reusable component for the settings rows so we don't repeat code!
  const SettingsRow = ({ icon, title, value, showChevron = true, isDestructive = false, nav }:SettingsRowProps ) => (
    
    <Pressable className="flex-row items-center py-4 border-b border-[#1A2235]" onPress={()=> nav && router.push(nav)}>
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
              // Using a placeholder avatar
              source={{ uri: 'https://i.pravatar.cc/150?img=11' }} 
              className="w-24 h-24 rounded-full border-2 border-[#00E5FF]"
            />
            {/* Edit Avatar Button */}
            <Pressable className="absolute bottom-0 right-0 bg-[#00E5FF] w-8 h-8 rounded-full items-center justify-center border-2 border-background">
              <Ionicons name="pencil" size={14} color="#000000" />
            </Pressable>
          </View>
          
          <Text className="text-primaryText text-2xl font-bold mt-4">
            Sophian Abdul Rahman
          </Text>
          <Text className="text-[#8899B6] text-sm mt-1">
            sophian@bingebox.com
          </Text>
          
          {/* Premium Badge */}
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
            <SettingsRow icon="download" title="Downloads" value="2.4 GB" nav="/movies/downloads" />
            <SettingsRow icon="heart" title="Favorite Genres" value="Anime, Action" showChevron={false} nav="/movies/favorites" />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-primaryText font-bold text-lg mb-2">App Settings</Text>
          <View className="bg-surface px-4 rounded-2xl">
            <SettingsRow icon="person" title="Account Details" />
            <SettingsRow icon="card" title="Subscription" value="Active" />
            
            {/* Custom Row for the Toggle Switch */}
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
            <SettingsRow icon="log-out" title="Sign Out" isDestructive={true} showChevron={false} />
          </View>
        </View>
<View className='h-20'></View>
      </ScrollView>

    </SafeAreaView>
  );
}