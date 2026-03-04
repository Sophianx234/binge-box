import { create } from 'zustand';

import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BearState {
  bears: number;
  increasePopulation: () => void;
  removeAllBears: () => void;
  updateBears: (newBears: number) => void;
}

export const useStore = create<BearState>((set) => ({
  bears: 0,
  increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears) => set({ bears: newBears }),
}));



// 1. We define the exact shape of the data we want to save. 
// We don't save the whole TMDB object to save memory!
export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

// 2. Define the Store's State and Actions
interface MovieState {
  savedMovies: SavedMovie[];
  toggleSaveMovie: (movie: SavedMovie) => void;
}

// 3. Create the Store with the 'persist' middleware
export const useMovieStore = create<MovieState>()(
  persist(
    (set) => ({
      savedMovies: [], // Initial state is an empty array
      
      toggleSaveMovie: (movie) => set((state) => {
        // Check if the movie already exists in the array
        const isSaved = state.savedMovies.some((m) => m.id === movie.id);
        
        if (isSaved) {
          // If it's already saved, remove it (filter it out)
          return {
            savedMovies: state.savedMovies.filter((m) => m.id !== movie.id),
          };
        } else {
          // If it's not saved, add it to the beginning of the array so new saves appear first
          return {
            savedMovies: [movie, ...state.savedMovies],
          };
        }
      }),
    }),
    {
      name: 'bingebox-movie-storage', // The unique key used in AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // Tells Zustand to use React Native's storage
    }
  )
);