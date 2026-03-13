import { View, Text, FlatList, Image, Pressable } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const TopTenRow = ({ data }: { data: any[] }) => {
  const router = useRouter();

  return (
    <View className="mt-8">
      <Text className="text-white text-xl font-bold px-5 mb-4">Top 10 in Ghana Today</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        clipToPadding={false} // <-- CRITICAL: Prevents the big numbers from getting clipped!
        contentContainerStyle={{ paddingHorizontal: 40, gap: 40 }}
        data={data.slice(0, 10)}
        renderItem={({ item, index }) => (
          <Pressable 
            onPress={() => router.push({ pathname: '/movies/[id]', params: { id: item.id, type: item.media_type || 'movie' } })}
            className="relative w-32 h-48"
          >
            <Text 
               className="absolute -left-10 bottom-[-15] text-[100px] font-black opacity-80 z-[-1]"
               style={{ color: '#000', textShadowColor: '#00E5FF', textShadowRadius: 1, textShadowOffset: { width: 1, height: 1 } }}
            >
              {index + 1}
            </Text>
            <Image 
              source={{ uri: `https://image.tmdb.org/t/p/w300${item.poster_path}` }}
              className="w-full h-full rounded-lg"
            />
          </Pressable>
        )}
      />
    </View>
  );
};

export default TopTenRow;