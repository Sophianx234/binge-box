import { View, Text, FlatList, Pressable, Image, Switch } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { useMovieStore } from '@/store/store'; // <-- Import the store

export default function DownloadsScreen() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [smartDownloadsEnabled, setSmartDownloadsEnabled] = useState(true);

  // --- REPLACE DUMMY DATA WITH ZUSTAND ---
  const downloads = useMovieStore((state) => state.downloadedMovies);
  const removeDownload = useMovieStore((state) => state.removeDownload);
  const toggleDownloadStatusStore = useMovieStore((state) => state.toggleDownloadStatusStore);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-5 pt-6">
        
        {/* --- HEADER --- */}
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-primaryText text-3xl font-bold">Downloads</Text>
          <Pressable className="w-10 h-10 bg-surface rounded-full items-center justify-center border border-[#1A2235]">
            <Ionicons name="settings-outline" size={20} color="#00E5FF" />
          </Pressable>
        </View>

        {/* --- SMART DOWNLOADS SECTION --- */}
        <View className="bg-surface rounded-2xl mb-6 overflow-hidden border border-[#1A2235]">
          <Pressable onPress={() => setIsExpanded(!isExpanded)} className="flex-row items-center p-4">
            <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${smartDownloadsEnabled ? 'bg-[#00E5FF]/10' : 'bg-[#1A2235]'}`}>
              <Ionicons name="flash" size={20} color={smartDownloadsEnabled ? "#00E5FF" : "#8899B6"} />
            </View>
            <View className="flex-1">
              <Text className="text-primaryText font-bold text-base">Smart Downloads</Text>
              <Text className="text-[#8899B6] text-xs mt-0.5">
                {smartDownloadsEnabled ? (wifiOnly ? 'Active • Wi-Fi Only' : 'Active • All Data') : 'Inactive'}
              </Text>
            </View>
            <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#8899B6" />
          </Pressable>

          {isExpanded && (
            <View className="px-4 pb-4 border-t border-[#1A2235] pt-4 space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-primaryText text-sm font-bold">Auto-Download Next</Text>
                  <Text className="text-[#8899B6] text-xs mt-1 leading-5">Downloads next episodes and removes watched ones.</Text>
                </View>
                <Switch value={smartDownloadsEnabled} onValueChange={setSmartDownloadsEnabled} trackColor={{ false: '#1A2235', true: '#00E5FF' }} />
              </View>
            </View>
          )}
        </View>

        {/* --- DOWNLOADS LIST --- */}
        <FlatList
          data={downloads}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20 px-10">
              <Ionicons name="cloud-download-outline" size={80} color="#1A2235" />
              <Text className="text-primaryText text-xl font-bold mt-4">Offline is boring</Text>
              <Text className="text-[#8899B6] text-center mt-2 leading-6">Download your favorite movies so you can watch them anywhere, anytime.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="flex-row items-center bg-surface rounded-2xl mb-4 p-3 border border-[#1A2235]">
              {/* Poster with Play Overlay */}
              <Pressable onPress={() => router.push(`/movies/${item.id}`)} className="relative">
                <Image 
                  source={{ uri: item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : undefined }}
                  className="w-20 h-28 bg-background rounded-lg"
                  resizeMode="cover"
                />
                {item.status === 'completed' && (
                  <View className="absolute inset-0 items-center justify-center bg-black/40 rounded-lg">
                    <Ionicons name="play" size={24} color="#00E5FF" />
                  </View>
                )}
              </Pressable>
              
              {/* Info & Progress */}
              <View className="flex-1 ml-4 py-1">
                <Text className="text-primaryText font-bold text-md mb-1" numberOfLines={1}>{item.title}</Text>
                <Text className="text-[#8899B6] text-xs mb-3">{item.duration} • {item.size}</Text>

                {item.status !== 'completed' && (
                  <View>
                    <View className="w-full h-1 bg-[#1A2235] rounded-full overflow-hidden mb-2">
                      <View 
                        style={{ width: `${item.progress}%` }} 
                        className={`h-full ${item.status === 'paused' ? 'bg-[#4B5563]' : 'bg-[#00E5FF]'}`} 
                      />
                    </View>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${item.status === 'paused' ? 'text-[#8899B6]' : 'text-[#00E5FF]'}`}>
                      {item.status === 'downloading' ? `Downloading ${Math.round(item.progress)}%` : 'Paused'}
                    </Text>
                  </View>
                )}
                {item.status === 'completed' && (
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color="#00E5FF" />
                    <Text className="text-[#00E5FF] text-[10px] font-bold ml-1 uppercase">Ready to Watch</Text>
                  </View>
                )}
              </View>

              {/* Action Column */}
              <View className="ml-2 items-center justify-center space-y-6">
                {item.status !== 'completed' && (
                  <Pressable onPress={() => toggleDownloadStatusStore(item.id)} className="w-8 h-8 items-center justify-center bg-background rounded-full border border-[#1A2235]">
                    <Ionicons name={item.status === 'downloading' ? "pause" : "play"} size={14} color="#F8F9FA" />
                  </Pressable>
                )}
                {/* Changed handleDelete to removeDownload */}
                <Pressable onPress={() => removeDownload(item.id)} className="w-8 h-8 items-center justify-center">
                  <Ionicons name="close-circle-outline" size={24} color="#EF4444" />
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}