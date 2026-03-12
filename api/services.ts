const tmdb_config = {
  baseUrl: 'https://api.themoviedb.org/3', 
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_RAT}` 
  }
};

export const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});
 
const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

// ==========================================
// TMDB EXTERNAL API FETCHES
// ==========================================

export const fetchMovies = async (query?: string) => {
  try {
    const endpoint = query 
      ? `/search/movie?query=${encodeURIComponent(query)}` 
      : `/discover/movie?sort_by=popularity.desc`; 

    const response = await fetch(`${tmdb_config.baseUrl}${endpoint}`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results; 

  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error; 
  }
};

export const fetchMovieDetails = async (id: string | string[]) => {
  try {
    const response = await fetch(`${tmdb_config.baseUrl}/movie/${id}?append_to_response=videos,reviews`, {
      headers: tmdb_config.headers
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const fetchMoviesByPath = async (path: string) => {
  try {
    const response = await fetch(`${tmdb_config.baseUrl}${path}`, {
      headers: tmdb_config.headers
    });
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error(`Error fetching from ${path}:`, error);
    return [];
  }
};

// ==========================================
// CUSTOM EXPRESS API - MOVIE ACTIONS
// ==========================================

// Fetch all user interactions (Watchlist, Favorites, Downloads, Ratings)
export const getMyLibrary = async (token: string) => {
  const res = await fetch(`${url}/movies`, {
    headers: getHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch library');
  return data;
};

// Toggle a movie in the watchlist
export const saveMovie = async (token: string, movieData: any) => {
  const res = await fetch(`${url}/movies`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(movieData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update watchlist');
  return data;
};

// Toggle Favorite (The Heart Icon) - UPDATED: Now accepts full movie data
export const toggleFavorite = async (token: string, movieData: any) => {
  // PROOF LOG: This will print in your VS Code terminal!
  console.log("SENDING TO BACKEND: ", JSON.stringify(movieData));

  const res = await fetch(`${url}/movies/favorite`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(movieData), 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle favorite');
  return data;
};

// Rate a Movie (The Stars) - UPDATED: Now accepts full movie data
export const rateMovie = async (token: string, movieData: any, rating: number) => {
  const res = await fetch(`${url}/movies/rate`, {
    method: 'POST',
    headers: getHeaders(token),
    // Combines the movie details and the rating into one payload
    body: JSON.stringify({ ...movieData, rating }), 
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save rating');
  return data;
};

// Mark as Downloaded
export const markAsDownloaded = async (token: string, movieData: any) => {
  const res = await fetch(`${url}/movies/download`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(movieData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to sync download');
  return data;
};

// ==========================================
// CUSTOM EXPRESS API - AUTHENTICATION
// ==========================================

export const registerUser = async (userData: any) => {
  const response = await fetch(`${url}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to register');
  }

  return data;
};

export const loginUser = async (credentials: any) => {
  const response = await fetch(`${url}/users/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to log in');
  }

  return data;
};

export const requestPasswordReset = async (email: string) => {
  const response = await fetch(`${url}/users/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to send reset link');
  }

  return data;
};


// Fetch ONLY favorite movies
export const getFavoriteMovies = async (token: string) => {
  const res = await fetch(`${url}/movies/favorite`, {
    method: 'GET', // Explicitly making a GET request
    headers: getHeaders(token),
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch favorite movies');
  }
  
  return data;
};