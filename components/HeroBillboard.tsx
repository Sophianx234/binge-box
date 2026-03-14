import { View, Text, Image, Pressable, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
// --- NEW IMPORTS ---
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyLibrary, saveMovie } from '@/api/services';
import { useAuthStore } from '@/store/store';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = height * 0.70; 

const HeroBillboard = ({ movies }: { movies: any[] }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // --- AUTH & DATA FETCHING ---
  const token = useAuthStore((state) => state.token) as string;

  const { data: libraryData = [] } = useQuery({
    queryKey: ['myLibrary'],
    queryFn: () => getMyLibrary(token),
    enabled: !!token,
  });

  const saveMutation = useMutation({
    mutationFn: (movieData: any) => saveMovie(token, movieData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myLibrary'] }),
  });

  useEffect(() => {
    if (!movies || movies.length === 0) return;

    const timer = setInterval(() => {
      const nextIndex = (currentIndex + 1) % movies.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, 6000); 

    return () => clearInterval(timer);
  }, [currentIndex, movies]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    setCurrentIndex(index);
  };

  if (!movies || movies.length === 0) return null;

  return (
    <View style={{ height: HERO_HEIGHT, width }} className="bg-background relative ">
      <FlatList
        ref={flatListRef}
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        snapToInterval={width}
        decelerationRate="fast"
        bounces={false}
        renderItem={({ item }) => {
          const mediaType = item.media_type === 'tv' ? 'Series' : 'Film';

          // --- LOGIC FOR SAVED STATE ---
          const isSaved = Array.isArray(libraryData) && 
            libraryData.some((m: any) => m.tmdbId === item.id && m.inWatchlist);
          
          // Check if this specific item is currently being saved
          const isSaving = saveMutation.isPending && saveMutation.variables?.tmdbId === item.id;

          const handleSave = () => {
            saveMutation.mutate({ 
              tmdbId: item.id, 
              title: item.title || item.name, 
              posterPath: item.poster_path 
            });
          };

          return (
            <View style={{ width, height: HERO_HEIGHT }} className="flex-col">
              
              <View className="flex-[1.2] relative w-full bg-surface">
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/original${item.backdrop_path || item.poster_path}` }}
                  className="w-full h-full absolute inset-0"
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  className="absolute bottom-0 left-0 right-0 h-16"
                />
              </View>

              <View className="flex-1 bg-background px-6 pt-2 pb-10 justify-between">
                <View>
                  <Text 
                    className="text-accent text-4xl font-black text-center mb-4 tracking-tight" 
                    numberOfLines={2}
                  >
                    {item.title || item.name}
                  </Text>

                  <View className="flex-row justify-center items-center gap-3 mb-4">
                    <Text className="text-[#8899B6] text-xs font-bold uppercase tracking-widest">{mediaType}</Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                    <Text className="text-[#00E5FF] text-xs font-bold uppercase tracking-widest">Trending</Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                    <Text className="text-[#8899B6] text-xs font-bold uppercase tracking-widest">Top 5</Text>
                  </View>

                  <Text className="text-[#8899B6] text-sm text-center leading-5 px-2" numberOfLines={3}>
                    {item.overview || "Experience the trending sensation that everyone is talking about."}
                  </Text>
                </View>

                {/* THE BUTTONS */}
                <View className="flex-row gap-4 mt-6">
                  <Pressable
                    onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
                    className="flex-1 bg-accent flex-row items-center justify-center py-3.5 rounded-xl shadow-lg"
                    style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
                  >
                    <Ionicons name="play" size={22} color="black" />
                    <Text className="font-bold text-black text-base ml-2">Play</Text>
                  </Pressable>

                  {/* --- UPDATED MY LIST BUTTON --- */}
                  <Pressable 
                    onPress={handleSave}
                    disabled={isSaving}
                    className="flex-1 bg-surface/80 flex-row items-center justify-center py-3.5 rounded-xl border border-[#1A2235]"
                    style={({ pressed }) => [{ opacity: pressed || isSaving ? 0.7 : 1 }]}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#00E5FF" />
                    ) : (
                      <>
                        <Ionicons 
                          name={isSaved ? "checkmark" : "add"} 
                          size={22} 
                          color={isSaved ? "#00E5FF" : "white"} 
                        />
                        <Text className={`font-bold text-base ml-2 ${isSaved ? "text-[#00E5FF]" : "text-white"}`}>
                          {isSaved ? "Saved" : "My List"}
                        </Text>
                      </>
                    )}
                  </Pressable>
                </View>

              </View>
            </View>
          );
        }}
      />

      <View className="absolute bottom-2 left-0 right-0 flex-row justify-center items-center gap-2 pointer-events-none">
        {movies.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full  duration-300 ${
              currentIndex === index ? 'w-5 bg-[#00E5FF]' : 'w-1.5 bg-[#8899B6]/40'
            }`}
          />
        ))}
      </View>
    </View>
  );
};

export default HeroBillboard;