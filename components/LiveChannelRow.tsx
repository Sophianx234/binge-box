import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const LiveChannelsRow = () => {
  const router = useRouter();
  
  const { data: liveShows, isLoading } = useQuery({
    queryKey: ['liveChannels'],
    queryFn: () => fetchMediaList('/tv/on_the_air'),
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!liveShows || liveShows.length === 0) return null;

  return (
    <View className="mt-10 mb-8">
      
      {/* --- PREMIUM HEADER --- */}
      <View className="flex-row justify-between items-end px-5 mb-5">
        <View>
          <View className="flex-row items-center gap-2 mb-1">
            <View className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
            <Text className="text-[#EF4444] text-xs font-black tracking-widest uppercase">On Air</Text>
          </View>
          <Text className="text-white text-2xl font-black tracking-tight">Live Channels</Text>
        </View>
        <Text className="text-[#00E5FF] font-bold text-sm mb-1">Guide</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={liveShows.slice(0, 10)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          // Fake progress generator for the UI
          const progressPercent = (item.id % 60) + 20; 
          // Fake viewer count based on TMDB popularity
          const viewers = (item.popularity / 10).toFixed(1);

          return (
            <Pressable
              onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: 'tv' } })}
              // The Card Wrapper: Uses your surface color and slate border
              className="w-72 rounded-2xl bg-surface border border-[#1A2235] overflow-hidden shadow-2xl"
            >
              
              {/* --- TOP HALF: BROADCAST IMAGE --- */}
              <View className="w-full h-40 relative bg-[#09090B]">
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${item.backdrop_path || item.poster_path}` }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Slight dark fade at the bottom so the progress bar pops */}
                <LinearGradient
                  colors={['transparent', 'rgba(26,34,53,0.8)']}
                  className="absolute inset-x-0 bottom-0 h-10"
                />

                {/* LEFT BADGE: Glowing "LIVE" */}
                <View className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-3 py-1.5 flex-row items-center">
                  <View className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mr-2 animate-pulse" />
                  <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Live</Text>
                </View>

                {/* RIGHT BADGE: Viewer Count */}
                <View className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1.5 flex-row items-center gap-1.5">
                  <Ionicons name="eye" size={12} color="#8899B6" />
                  <Text className="text-[#8899B6] text-[10px] font-bold">{viewers}k</Text>
                </View>

                {/* EDGE-TO-EDGE PROGRESS BAR */}
                {/* Snapped directly to the bottom of the image container! */}
                <View className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A2235]">
                  <View 
                    className="h-full bg-[#EF4444]" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </View>
              </View>

              {/* --- BOTTOM HALF: METADATA PANEL --- */}
              <View className="p-4 flex-row items-center justify-between">
                
                <View className="flex-1 pr-3">
                  <Text className="text-[#00E5FF] text-[10px] font-black uppercase tracking-widest mb-1.5">
                    Now Playing
                  </Text>
                  <Text className="text-white font-extrabold text-base" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-[#8899B6] text-xs font-medium mt-1" numberOfLines={1}>
                    Up Next: Stay Tuned...
                  </Text>
                </View>
                
                {/* Premium Circular Play Button */}
                {/* Uses your background color to create depth against the surface color */}
                <View className="w-11 h-11 rounded-full bg-background border border-[#1A2235] items-center justify-center shadow-lg">
                  <Ionicons name="play" size={18} color="white" className="ml-1" />
                </View>

              </View>

            </Pressable>
          );
        }}
      />
    </View>
  );
};

export default LiveChannelsRow;