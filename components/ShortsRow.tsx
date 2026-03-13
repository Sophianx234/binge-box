import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ShortsRow = () => {
  const { data: shorts, isLoading } = useQuery({
    queryKey: ['trendingShorts'],
    queryFn: () => fetchMediaList('/trending/all/day'),
  });

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (!shorts || shorts.length === 0) return null;

  return (
    <View className="mt-8 mb-4">
      {/* UPGRADED HEADER: Added a "View All" text link to balance the layout */}
      <View className="flex-row items-center justify-between px-5 mb-4">
        <View className="flex-row items-center gap-2">
          <Ionicons name="recording" size={22} color="#00E5FF" />
          <Text className="text-white text-xl font-bold">Sneak Peeks</Text>
        </View>
        <Text className="text-[#8899B6] font-bold text-sm">View All</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={shorts.slice(0, 10)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => console.log('Opening Shorts Feed...')}
            // Taller, wider, with ultra-smooth iOS-style curved corners
            className="w-40 h-[280px] relative rounded-[24px] overflow-hidden border border-[#1A2235]"
          >
            {/* TALL POSTER IMAGE */}
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
              className="w-full h-full absolute inset-0"
              resizeMode="cover"
            />

            {/* TOP RIGHT BADGE (The "Clip" Indicator) */}
            <View className="absolute top-3 right-3 bg-black/60 border border-white/20 rounded-full px-2.5 py-1 flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mr-1.5" />
              <Text className="text-white text-[10px] font-bold tracking-widest uppercase">Clip</Text>
            </View>

            {/* BOTTOM FLOATING CONTROL PANEL */}
            <View className="absolute bottom-3 left-3 right-3">
              {/* Subtle background shadow so the panel always pops against bright posters */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                className="absolute -inset-10 -bottom-3"
              />
              
              {/* The Panel Itself */}
              <View className="bg-[#1A2235]/90 border border-white/10 rounded-xl p-3 flex-row items-center justify-between">
                
                {/* Text Block */}
                <View className="flex-1 mr-3">
                  <Text className="text-white font-extrabold text-sm" numberOfLines={1}>
                    {item.title || item.name}
                  </Text>
                  <Text className="text-[#8899B6] text-xs font-medium mt-0.5" numberOfLines={1}>
                    Tap to preview
                  </Text>
                </View>
                
                {/* High-Contrast Mini Play Button */}
                <View className="w-8 h-8 rounded-full bg-[#00E5FF] items-center justify-center shadow-lg">
                  <Ionicons name="play" size={14} color="black" className="ml-0.5" />
                </View>

              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
};

export default ShortsRow;