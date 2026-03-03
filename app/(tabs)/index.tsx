import Logo from "@/components/Logo";
import MovieList from "@/components/MovieList";
import SearchBar from "@/components/SearchBar";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
    
  return (
    <SafeAreaView className="bg-background px-5 flex-1">
      <View>
        <Logo/>

        <View>

        <SearchBar/>

        <MovieList/>
        
        </View>
      </View>
    </SafeAreaView>
  );
}
