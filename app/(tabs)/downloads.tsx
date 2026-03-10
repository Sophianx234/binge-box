import { View, Text, FlatList, Pressable, Image, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// 1. We expand our interface to track the exact state of the download
export interface DownloadItem {
  id: number;
  title: string;
  poster_path: string | null;
  size: string;
  duration: string;
  progress: number; // 0 to 100
  status: 'completed' | 'downloading' | 'paused';
}

export default function DownloadsScreen() {
  const router = useRouter();
  // Controls whether the drop-down is open or closed
  const [isExpanded, setIsExpanded] = useState(false);
  // An extra setting to make the drop-down look authentic
  const [wifiOnly, setWifiOnly] = useState(true);

  // 2. Smart Downloads State
  const [smartDownloadsEnabled, setSmartDownloadsEnabled] = useState(true);

  // 3. Interactive Mock Data (Notice the different statuses and progress levels!)
  const [downloads, setDownloads] = useState<DownloadItem[]>([
    { 
      id: 278, title: 'The Shawshank Redemption', poster_path: '/9cqNxxWXNDjPj11Vqr84nZcQ5jQ.jpg', 
      size: '1.8 GB', duration: '2h 22m', progress: 100, status: 'completed' 
    },
    { 
      id: 155, title: 'The Dark Knight', poster_path: '/qJ2tW6WMOTnwQSBiPO514lK4QcU.jpg', 
      size: '2.4 GB', duration: '2h 32m', progress: 45, status: 'downloading' 
    },
    { 
      id: 129, title: 'Spirited Away', poster_path: '/39wmItIWsg5sZMyRUHLkBgYtzHc.jpg', 
      size: '1.2 GB', duration: '2h 5m', progress: 12, status: 'paused' 
    },
  ]);

  // --- ACTIONS ---

  // Delete a movie completely
  const handleDelete = (id: number) => {
    setDownloads((prev) => prev.filter((movie) => movie.id !== id));
  };

  // Toggle between 'downloading' and 'paused'
  const toggleDownloadStatus = (id: number) => {
    setDownloads((prev) => 
      prev.map((movie) => {
        if (movie.id === id) {
          if (movie.status === 'downloading') return { ...movie, status: 'paused' };
          if (movie.status === 'paused') return { ...movie, status: 'downloading' };
        }
        return movie;
      })
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-6">
        
        {/* --- HEADER --- */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-primaryText text-3xl font-bold">Downloads</Text>
          <Pressable className="w-10 h-10 bg-surface rounded-full items-center justify-center">
            <Ionicons name="settings-outline" size={20} color="#F8F9FA" />
          </Pressable>
        </View>

        {/* --- SMART DOWNLOADS BANNER (Drop-down Accordion) --- */}
        <View className="bg-surface rounded-2xl mb-6 overflow-hidden">
          
          {/* The Clickable Header */}
          <Pressable 
            onPress={() => setIsExpanded(!isExpanded)}
            className="flex-row items-center p-4"
          >
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 transition-colors ${smartDownloadsEnabled ? 'bg-[#00E5FF]/10' : 'bg-[#1A2235]'}`}>
              <Ionicons 
                name="phone-portrait-outline" 
                size={20} 
                color={smartDownloadsEnabled ? "#00E5FF" : "#8899B6"} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-primaryText font-bold text-base">Smart Downloads</Text>
              <Text className="text-[#8899B6] text-xs mt-0.5">
                {smartDownloadsEnabled && wifiOnly ? 'ON • Wi-Fi Only' : smartDownloadsEnabled ? 'ON' : 'OFF'}
              </Text>
            </View>
            {/* The Chevron Arrow changes direction based on the isExpanded state */}
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#8899B6" 
            />
          </Pressable>

          {/* The Expanded Content Area */}
          {isExpanded && (
            <View className="px-4 pb-4 border-t border-[#1A2235] mt-1 pt-4">
              
              {/* Setting 1: Master Toggle */}
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-1 mr-4">
                  <Text className="text-primaryText text-sm font-bold">Enable Smart Downloads</Text>
                  <Text className="text-[#8899B6] text-xs mt-1 leading-5">
                    Automatically downloads the next movie in your series and deletes the ones you've finished.
                  </Text>
                </View>
                <Switch 
                  value={smartDownloadsEnabled} 
                  onValueChange={setSmartDownloadsEnabled}
                  trackColor={{ false: '#1A2235', true: '#00E5FF' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Setting 2: Wi-Fi Only */}
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className={`text-sm font-bold ${smartDownloadsEnabled ? 'text-primaryText' : 'text-[#8899B6]'}`}>
                    Download on Wi-Fi Only
                  </Text>
                  <Text className="text-[#8899B6] text-xs mt-1 leading-5">
                    Save your mobile data plan.
                  </Text>
                </View>
                <Switch 
                  value={wifiOnly} 
                  onValueChange={setWifiOnly}
                  trackColor={{ false: '#1A2235', true: '#00E5FF' }}
                  thumbColor="#FFFFFF"
                  disabled={!smartDownloadsEnabled} // Disables the switch if master toggle is OFF
                />
              </View>

            </View>
          )}
        </View>

        {/* --- LIST / EMPTY STATE --- */}
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
          
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <View className="w-24 h-24 bg-surface rounded-full items-center justify-center mb-6 border border-[#1A2235]">
                <Ionicons name="download-outline" size={48} color="#00E5FF" />
              </View>
              <Text className="text-primaryText text-xl font-bold mb-2">No downloads yet</Text>
              <Text className="text-[#8899B6] text-center px-4 mb-8 leading-6">
                Movies and shows you download will appear here for offline viewing.
              </Text>
              
              <Pressable 
                onPress={() => router.push('/search')}
                className="bg-[#00E5FF] px-8 py-4 rounded-full flex-row items-center"
              >
                <Text className="text-black font-bold text-base">Find Something to Watch</Text>
              </Pressable>
            </View>
          }

          renderItem={({ item }) => (
            <View className="flex-row items-center bg-surface rounded-2xl mb-4 p-3">
              
              {/* Poster */}
              <Pressable 
                onPress={() => router.push(`/movies/${item.id}`)}
                className="relative"
              >
                <Image 
                  source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined }}
                  className="w-24 h-36 bg-background rounded-xl"
                  resizeMode="cover"
                />
                {/* Only show the large play overlay if the download is completely finished */}
                {item.status === 'completed' && (
                  <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
                    <Ionicons name="play-circle" size={36} color="#FFFFFF" className="opacity-90" />
                  </View>
                )}
              </Pressable>
              
              {/* Movie Info & Dynamic Progress */}
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-primaryText font-bold text-lg mb-1" numberOfLines={2}>
                  {item.title}
                </Text>
                
                <Text className="text-[#8899B6] text-sm mb-3">
                  {item.duration} • {item.size}
                </Text>

                {/* Dynamic Progress Bar */}
                <View className="w-full h-1.5 bg-[#1A2235] rounded-full overflow-hidden mb-2">
                  <View 
                    style={{ width: `${item.progress}%` }} 
                    className={`h-full rounded-full ${item.status === 'paused' ? 'bg-[#8899B6]' : 'bg-[#00E5FF]'}`} 
                  />
                </View>

                {/* Dynamic Status Text */}
                <Text className={`text-xs font-bold ${item.status === 'completed' ? 'text-[#00E5FF]' : 'text-[#8899B6]'}`}>
                  {item.status === 'completed' && 'Downloaded'}
                  {item.status === 'downloading' && `Downloading... ${item.progress}%`}
                  {item.status === 'paused' && `Paused - ${item.progress}%`}
                </Text>
              </View>

              {/* Action Buttons (Play/Pause & Delete) */}
              <View className="ml-2 items-center justify-between h-32 py-1">
                
                {/* Top Button: Pause or Play (Hidden if completed) */}
                {item.status !== 'completed' ? (
                  <Pressable onPress={() => toggleDownloadStatus(item.id)} className="p-2 bg-background rounded-full">
                    <Ionicons 
                      name={item.status === 'downloading' ? "pause" : "play"} 
                      size={20} 
                      color="#F8F9FA" 
                    />
                  </Pressable>
                ) : (
                  <View className="p-2 h-10" /> /* Empty spacer so the trash can stays at the bottom */
                )}

                {/* Bottom Button: Always Trash */}
                <Pressable onPress={() => handleDelete(item.id)} className="p-2">
                  <Ionicons name="trash-outline" size={22} color="#EF4444" />
                </Pressable>

              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}