import { View, Text, ScrollView, Pressable, Image, Switch, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '@/store/store'; 
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query'; 
import { getMyLibrary, uploadAvatarToServer } from '@/api/services';
import * as ImagePicker from 'expo-image-picker'; 

export type SettingsRowProps = {
  icon: string;
  title: string;
  value?: string; 
  showChevron?: boolean;
  isDestructive?: boolean;
  nav?: any; 
  onPress?: () => void; 
};

export default function ProfileScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  
  // --- NEW STATE FOR THEME DROPDOWN ---
  const [theme, setTheme] = useState('Dark');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  
  const { logout, user, token, updateUser } = useAuthStore((state) => ({
    logout: state.logout,
    user: state.user,
    token: state.token,
    updateUser: state.updateUser 
  }));
  const router = useRouter();

  const { data: libraryData = [] } = useQuery({
    queryKey: ['myLibrary'],
    queryFn: () => getMyLibrary(token as string),
    enabled: !!token,
  });

  const savedCount = Array.isArray(libraryData) 
    ? libraryData.filter((m: any) => m.inWatchlist).length 
    : 0;

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.status !== 'granted') {
        Alert.alert("Permission Required", "You need to allow access to your photos to change your profile picture.");
        return; 
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true, 
        aspect: [1, 1], 
        quality: 0.5, 
      });

      if (!result.canceled) {
        setIsUploading(true); 
        const selectedUri = result.assets[0].uri;
        
        const updatedUser = await uploadAvatarToServer(token as string, selectedUri);
        await updateUser(updatedUser);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Upload Failed", "Something went wrong while uploading your picture.");
    } finally {
      setIsUploading(false);
    }
  };

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
      {showChevron && <Ionicons name={isThemeDropdownOpen && title === 'App Theme' ? 'chevron-down' : 'chevron-forward'} size={18} color="#8899B6" className="opacity-50" />}
    </Pressable>
  );

  return (
    <SafeAreaView className="bg-background flex-1">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-5">
        
        {/* --- HEADER: USER INFO --- */}
        <View className="items-center mt-6 mb-8">
          <Pressable onPress={pickImage} disabled={isUploading} className="relative">
            <Image 
              source={{ uri: user?.avatar || 'https://i.pravatar.cc/150?img=11' }} 
              className={`w-28 h-28 rounded-full border-4 border-[#00E5FF] ${isUploading ? 'opacity-40' : 'opacity-100'}`}
            />
            {!isUploading && (
              <View className="absolute bottom-0 right-0 bg-[#00E5FF] p-2 rounded-full border-2 border-background shadow-sm">
                <Ionicons name="camera" size={18} color="#000000" />
              </View>
            )}
            {isUploading && (
              <View className="absolute inset-0 items-center justify-center">
                <ActivityIndicator size="small" color="#00E5FF" />
              </View>
            )}
          </Pressable>
          
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
            <Text className="text-primaryText font-bold text-xl">{savedCount}</Text>
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
            <SettingsRow icon="heart" title="My Favorites" showChevron={true} nav="/(tabs)/favorites" />
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-primaryText font-bold text-lg mb-2">App Settings</Text>
          <View className="bg-surface px-4 rounded-2xl">
            <SettingsRow icon="person" title="Account Details" nav='/account'/>
            {/* CHANGED: Now displays "Pro" instead of "Active" */}
            <SettingsRow icon="card" title="Subscription" value="Pro" nav='/subscriptions' />
            
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
            
            {/* DROPDOWN TRIGGER */}
            <SettingsRow 
              icon="color-palette" 
              title="App Theme" 
              value={theme} 
              onPress={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)} 
            />

            {/* EXPANDABLE DROPDOWN MENU */}
            {isThemeDropdownOpen && (
              <View className="bg-[#1A2235] mt-1 mb-4 rounded-xl overflow-hidden border border-[#00E5FF]/20">
                <Pressable 
                  onPress={() => { setTheme('Dark'); setIsThemeDropdownOpen(false); }}
                  className="flex-row items-center justify-between p-4 border-b border-background"
                >
                  <Text className={`text-base font-medium ${theme === 'Dark' ? 'text-[#00E5FF]' : 'text-[#8899B6]'}`}>Dark</Text>
                  {theme === 'Dark' && <Ionicons name="checkmark-circle" size={20} color="#00E5FF" />}
                </Pressable>
                
                <Pressable 
                  onPress={() => { setTheme('Light'); setIsThemeDropdownOpen(false); }}
                  className="flex-row items-center justify-between p-4"
                >
                  <Text className={`text-base font-medium ${theme === 'Light' ? 'text-[#00E5FF]' : 'text-[#8899B6]'}`}>Light</Text>
                  {theme === 'Light' && <Ionicons name="checkmark-circle" size={20} color="#00E5FF" />}
                </Pressable>
              </View>
            )}

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