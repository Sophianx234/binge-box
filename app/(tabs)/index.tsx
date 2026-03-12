import Logo from '@/components/Logo';
import MovieRow from '@/components/MovieList';
import MovieList from '@/components/MovieList';
import SearchBar from '@/components/SearchBar';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaView className="flex-1 bg-background ">
      {/* 1. Logo stays at the top */}
      <Logo />

      {/* 2. SearchBar sits right below the logo (added a little margin bottom to space it out) */}
      <View className="-mb-6 ">
        <SearchBar />
      </View>

      {/* 3. MovieList is a direct child and has flex-1 inside its own code, 
             so it will perfectly fill the rest of the screen! */}
      <ScrollView showsVerticalScrollIndicator={false} className=" flex-1 ">
       <MovieRow 
  title="Trending This Week" 
  endpointPath="/trending/all/week" 
  // We leave defaultMediaType blank because /trending/all provides media_type natively!
/>

{/* MOVIES */}
<MovieRow 
  title="Popular Movies" 
  endpointPath="/movie/popular" 
  defaultMediaType="movie" 
/>
<MovieRow 
  title="Top Rated Movies" 
  endpointPath="/movie/top_rated" 
  defaultMediaType="movie" 
/>

{/* TV SHOWS */}
<MovieRow 
  title="Popular TV Shows" 
  endpointPath="/tv/popular" 
  defaultMediaType="tv" 
/>
<MovieRow 
  title="Airing Today" 
  endpointPath="/tv/airing_today" 
  defaultMediaType="tv" 
/>

        {/* Extra Padding for Bottom Tabs */}
        <View className="h-28" />
      </ScrollView>
    </SafeAreaView>
  );
}
