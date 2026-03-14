import { View, Text, FlatList, Image, Pressable, ActivityIndicator, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import React, { useCallback, useState, useEffect, useRef } from 'react'; 
import { useRouter, useFocusEffect } from 'expo-router'; 
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/store';
import { getContinueWatching } from '@/api/services';

// Helper function to turn raw seconds into "1h 24m remaining"
const formatTimeRemaining = (total: number, stopped: number) => {
  if (!total) return 'Resume watching';
  
  const remainingSeconds = total - stopped;
  if (remainingSeconds <= 60) return 'Almost done';
  
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

const ContinueWatchingRow = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token) as string;

  const { data: watchList = [], isLoading, refetch } = useQuery({
    queryKey: ['continueWatching'],
    queryFn: () => getContinueWatching(token),
    enabled: !!token,
  });

  useFocusEffect(
    useCallback(() => {
      if (token) refetch();
    }, [token, refetch])
  );

  // --- AUTO SLIDER STATE & LOGIC ---
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayList = watchList.slice(0, 5); // Max 5 items

  useEffect(() => {
    // Don't auto-slide if there's only 1 item to watch
    if (displayList.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % displayList.length;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
        viewPosition: 0, // Aligns the item to the left
        viewOffset: 20,  // Offsets for the paddingHorizontal: 20 so it looks perfect
      });
      
      setCurrentIndex(nextIndex);
    }, 5000); // Slides every 5 seconds

    return () => clearInterval(timer);
  }, [currentIndex, displayList.length]);

  // If the user manually swipes, update the index so the timer doesn't jump weirdly
  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = 256 + 16; // width (w-64 = 256) + gap (16)
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
       <View className="mt-8 mb-2 h-40 justify-center items-center">
         <ActivityIndicator size="large" color="#00E5FF" />
       </View>
    );
  }

  if (!displayList || displayList.length === 0) {
    return (
      <View className="mt-8 mb-2 px-5">
        <Text className="text-white text-xl font-bold mb-4">Continue Watching</Text>
        <View className="py-6 px-4 rounded-2xl border border-[#1A2235] bg-surface/30 items-center justify-center">
          <Ionicons name="play-circle-outline" size={32} color="#8899B6" className="mb-2" />
          <Text className="text-[#8899B6] text-sm text-center">
            Movies and shows you start watching will appear here.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8 mb-2">
      <Text className="text-white text-xl font-bold px-5 mb-4">Continue Watching</Text>
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={displayList} 
        keyExtractor={(item) => item.id.toString()}
        onMomentumScrollEnd={handleScrollEnd} // Sync manual swipes
        snapToInterval={272} // 256 (w-64) + 16 (gap) = Smooth manual snapping
        decelerationRate="fast"
        // Failsafe in case React Native tries to scroll before items are rendered
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
          });
        }}
        renderItem={({ item }) => {
          
          let progressPercent = 0;
          if (item.totalDurationSeconds && item.totalDurationSeconds > 0) {
            progressPercent = (item.stoppedAtSeconds / item.totalDurationSeconds) * 100;
          }
          progressPercent = Math.min(Math.max(progressPercent, 0), 100);

          let subtitle = '';
          if (item.mediaType === 'tv' && item.seasonNumber && item.episodeNumber) {
            subtitle = `S${item.seasonNumber} : E${item.episodeNumber}`;
          } else {
            subtitle = formatTimeRemaining(item.totalDurationSeconds, item.stoppedAtSeconds);
          }

          const playParams: any = { 
            id: item.tmdbId,          
            tmdbId: item.tmdbId,      
            type: item.mediaType || 'movie',
            title: item.title,
            posterPath: item.posterPath,
            runtime: item.totalDurationSeconds ? Math.floor(item.totalDurationSeconds / 60) : 0 
          };
    
          if (item.mediaType === 'tv') {
            playParams.season = item.seasonNumber;
            playParams.episode = item.episodeNumber;
          }

          return (
            <Pressable 
              onPress={() => router.push({ pathname: '/player', params: playParams })}
              className="w-64"
            >
              <View className="relative w-full aspect-video bg-surface rounded-lg overflow-hidden mb-3 border border-[#1A2235]">
                <Image 
                  source={{ uri: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : 'https://via.placeholder.com/500x281?text=No+Image' }}
                  className="w-full h-full opacity-70"
                  resizeMode="cover" 
                />
                
                <View className="absolute inset-0 items-center justify-center">
                  <View className="bg-black/60 p-3 rounded-full border border-white/20">
                    <Ionicons name="play" size={24} color="#00E5FF" />
                  </View>
                </View>

                <View className="absolute bottom-0 left-0 right-0 h-1 bg-[#1A2235]">
                  <View 
                    className="h-full bg-[#00E5FF]" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </View>

              </View>
              
              <Text className="text-primaryText font-bold text-sm" numberOfLines={1}>
                {item.title}
              </Text>
              <Text className="text-[#8899B6] text-xs mt-0.5">
                {subtitle}
              </Text>

            </Pressable>
          );
        }}
      />
    </View>
  );
};

export default ContinueWatchingRow;