import React from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { fetchMediaList } from '@/api/services';

import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import MovieRow from '@/components/MovieList'; 
import HeroBillboard from '@/components/HeroBillboard';
import TopTenRow from '@/components/TopTenRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';
import StudioHubs from '@/components/StudioHubs';
import TrendingStarsRow from '@/components/TrendingStarRow';
import ComingSoonRow from '@/components/ComingSoonRow';
import BecauseYouWatchedRow from '@/components/BecauseYouWatchedRow';

export default function Home() {
  const { data: trending = [], isLoading } = useQuery({
    queryKey: ['trendingAllDay'],
    queryFn: () => fetchMediaList('/trending/all/day'),
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Logo />
        <SearchBar />

{/* 2. Premium UI Components */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#00E5FF" className="my-20" />
        ) : (
          <View className="pb-6 "> 
            
            {/* HERO BILLBOARD: Added mb-8 (margin-bottom) to separate it from the rows */}
            {trending.length > 0 && (
              <View className="mb-16">
                <HeroBillboard movie={trending[0]} />
              </View>
            )}

            {/* A wrapper with gap-y-4 to automatically space out the rows evenly */}
            <View className="flex-col pt-24 gap-y-4">
              {/* Continue Watching */}
              {trending.length > 1 && <ContinueWatchingRow data={trending.slice(1, 6)} />}

              {/* Top 10 Row */}
              {trending.length > 0 && <TopTenRow data={trending} />}

              {/* Studio Hubs */}
              <StudioHubs />
              <TrendingStarsRow/>
              <ComingSoonRow/>
              
                <BecauseYouWatchedRow 
                  movieId={trending[2].id} 
                  movieTitle={trending[2].title || trending[2].name} 
                />
            </View>

          </View>
        )}
        <MovieRow title="Trending This Week" endpointPath="/trending/all/week" />
        <MovieRow title="Popular Movies" endpointPath="/movie/popular" defaultMediaType="movie" />
        <MovieRow title="Popular TV Shows" endpointPath="/tv/popular" defaultMediaType="tv" />
        <MovieRow title="Top Rated Movies" endpointPath="/movie/top_rated" defaultMediaType="movie" />
      </ScrollView>
    </SafeAreaView>
  );
}