import { View, Text, FlatList, Image, Pressable, ActivityIndicator } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services'; 
import { useRouter } from 'expo-router';

const TrendingStarsRow = () => {
  const router = useRouter();
  
  // 1. Setup the reference and state for our auto-scroller
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: stars, isLoading } = useQuery({
    queryKey: ['trendingStars'],
    queryFn: () => fetchMediaList('/trending/person/week'),
  });

  // 2. Filter out anyone without an image, THEN grab the top 12!
  const validStars = React.useMemo(() => {
    if (!stars) return [];
    return stars
      .filter((star: any) => star.profile_path !== null)
      .slice(0, 12);
  }, [stars]);

  // 3. The Auto-Scroll Timer
  useEffect(() => {
    if (validStars.length === 0) return;

    const timer = setInterval(() => {
      // Calculate next index, loop back to 0 if we hit the end
      const nextIndex = (currentIndex + 1) % validStars.length;
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      
      setCurrentIndex(nextIndex);
    }, 3000); // Smoothly slides every 3 seconds

    return () => clearInterval(timer);
  }, [currentIndex, validStars.length]);

  if (isLoading) return <ActivityIndicator color="#00E5FF" className="my-6" />;
  if (validStars.length === 0) return null;

  return (
    <View className="mt-6 mb-4">
      <Text className="text-white text-xl font-bold px-5 mb-4">Trending Stars</Text>
      
      <FlatList
        ref={flatListRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
        data={validStars} 
        keyExtractor={(item) => item.id.toString()}
        
        // 4. CRITICAL: Tells React Native exactly how wide each item is (w-24=96px + gap=16px)
        // This prevents the FlatList from crashing during auto-scroll
        getItemLayout={(data, index) => ({
          length: 112,
          offset: 112 * index,
          index,
        })}
        
        renderItem={({ item }) => (
          <Pressable 
            className="items-center w-24"
            // CHANGE THIS LINE:
            onPress={() => router.push(`/person/${item.id}`)}
          >
            {/* THE SLANTED CONTAINER */}
            <View 
              className="w-20 h-28 overflow-hidden border border-[#1A2235] bg-surface mb-3 rounded-lg"
              style={{ transform: [{ skewX: '-15deg' }] }}
            >
              <Image 
                source={{ uri: `https://image.tmdb.org/t/p/w200${item.profile_path}` }}
                className="w-full h-full opacity-90"
                resizeMode="cover"
                style={{ transform: [{ skewX: '15deg' }, { scale: 1.2 }] }}
              />
            </View>
            
            {/* ACTOR NAME */}
            <Text 
              className="text-white font-bold text-xs text-center" 
              numberOfLines={2}
            >
              {item.name}
            </Text>
            
            {/* KNOWN FOR */}
            <Text className="text-[#8899B6] text-[10px] text-center mt-0.5" numberOfLines={1}>
              {item.known_for_department}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
};

export default TrendingStarsRow;