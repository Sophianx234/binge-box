import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store'; // <-- Added SecureStore

// ==========================================
// 1. BEAR STORE (Testing/Boilerplate)
// ==========================================
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

// ==========================================
// 2. MOVIE STORE (Persisted with AsyncStorage)
// ==========================================
export interface SavedMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface MovieState {
  savedMovies: SavedMovie[];
  toggleSaveMovie: (movie: SavedMovie) => void;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set) => ({
      savedMovies: [],
      toggleSaveMovie: (movie) =>
        set((state) => {
          const isSaved = state.savedMovies.some((m) => m.id === movie.id);
          if (isSaved) {
            return { savedMovies: state.savedMovies.filter((m) => m.id !== movie.id) };
          } else {
            return { savedMovies: [movie, ...state.savedMovies] };
          }
        }),
    }),
    {
      name: 'bingebox-movie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==========================================
// 3. AUTH STORE (Secured with expo-secure-store)
// ==========================================
interface AuthState {
  token: string | null;
  setToken: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkTokenAtStartup: () => Promise<void>; // Added this to load the token when the app opens!
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,

  // Save token to state AND secure hardware
  setToken: async (newToken: string) => {
    await SecureStore.setItemAsync('userToken', newToken);
    set({ token: newToken });
  },

  // Remove token from state AND secure hardware
  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ token: null });
  },

  // Call this ONCE when your _layout.tsx mounts to check if they are already logged in
  checkTokenAtStartup: async () => {
    const savedToken = await SecureStore.getItemAsync('userToken');
    if (savedToken) {
      set({ token: savedToken });
    }
  },
}));
