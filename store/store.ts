import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

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
// 2. MOVIE STORE (Downloads ONLY - Client State)
// ==========================================
export interface DownloadItem {
  id: number;
  title: string;
  poster_path: string | null;
  size: string;
  duration: string;
  progress: number;
  status: 'completed' | 'downloading' | 'paused';
}

interface MovieState {
  downloadedMovies: DownloadItem[]; 
  updateDownloadProgress: (id: number, progress: number) => void;
  addDownload: (movie: DownloadItem) => void;
  removeDownload: (id: number) => void;
  toggleDownloadStatusStore: (id: number) => void;
}

export const useMovieStore = create<MovieState>()(
  persist(
    (set) => ({
      downloadedMovies: [],

      updateDownloadProgress: (id, progress) =>
        set((state) => ({
          downloadedMovies: state.downloadedMovies.map((movie) => {
            if (movie.id === id) {
              const newStatus = progress >= 100 ? 'completed' : movie.status;
              return { ...movie, progress: Math.min(progress, 100), status: newStatus };
            }
            return movie;
          }),
        })),

      addDownload: (movie) =>
        set((state) => {
          if (state.downloadedMovies.some((m) => m.id === movie.id)) return state;
          return { downloadedMovies: [movie, ...state.downloadedMovies] };
        }),

      removeDownload: (id) =>
        set((state) => ({
          downloadedMovies: state.downloadedMovies.filter((m) => m.id !== id),
        })),

      toggleDownloadStatusStore: (id) =>
        set((state) => ({
          downloadedMovies: state.downloadedMovies.map((movie) => {
            if (movie.id === id) {
              return {
                ...movie,
                status: movie.status === 'downloading' ? 'paused' : 'downloading',
              };
            }
            return movie;
          }),
        })),
    }),
    {
      name: 'bingebox-movie-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ==========================================
// 3. AUTH STORE (Secured + AsyncStorage)
// ==========================================
export interface User {
  id: string | number;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  bio?: string;
  birthdate?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => Promise<void>; 
  logout: () => Promise<void>;
  checkTokenAtStartup: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>; // <-- ADDED
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null, 

  setAuth: async (newToken: string, userData: User) => {
    await SecureStore.setItemAsync('userToken', newToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData)); 
    set({ token: newToken, user: userData });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await AsyncStorage.removeItem('userData'); 
    set({ token: null, user: null });
  },

  checkTokenAtStartup: async () => {
    const savedToken = await SecureStore.getItemAsync('userToken');
    const savedUser = await AsyncStorage.getItem('userData'); 
    
    if (savedToken && savedUser) {
      set({ 
        token: savedToken, 
        user: JSON.parse(savedUser) 
      });
    }
  },

  // --- NEW: Updates the user object in local storage and active state ---
  updateUser: async (updatedUser: User) => {
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));