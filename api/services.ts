const tmdb_config = {
  baseUrl: 'https://api.themoviedb.org/3', 
  // We don't need the short API Key at all if we use the Access Token!
  headers: {
    accept: 'application/json',
    // Make sure this points to the long Access Token, not the short API Key
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_RAT}` 
  }
};


export const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});
 
const url = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
// 1. Make the query optional by using the "?" in TypeScript
export const fetchMovies = async (query?: string) => {
  try {
    // 2. Dynamically choose the endpoint based on whether a query exists
    // If there is a query, use the search endpoint. Otherwise, use discover.
    const endpoint = query 
      ? `/search/movie?query=${encodeURIComponent(query)}` 
      : `/discover/movie?sort_by=popularity.desc`; // Default to popular movies if no search query

    const response = await fetch(`${tmdb_config.baseUrl}${endpoint}`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // 3. Pro-Tip: TMDB wraps the actual movie array inside a "results" object. 
    // Returning data.results saves you a headache later!
    return data.results; 

  } catch (error) {
    console.error('Error fetching movies:', error);
    throw error; 
  }
};


export const fetchMovieDetails = async (id: string | string[]) => {
  try {
    // We appended "?append_to_response=videos" to grab the trailers in the exact same request!
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



// Fetch all saved movies
export const getMyLibrary = async (token: string) => {
  const res = await fetch(`${url}/movies`, {
    headers: getHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to fetch library');
  return res.json();
};

// Save a movie to watchlist (The initial Save)
export const saveMovie = async (token: string, movieData: any) => {
  const res = await fetch(`${url}/movies`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(movieData),
  });
  return res.json();
};



// Toggle Favorite (The Heart Icon)
export const toggleFavorite = async (token: string, tmdbId: number) => {
  const res = await fetch(`${url}/movies/favorite`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ tmdbId }),
  });
  return res.json();
};

// Rate a Movie (The Stars)
export const rateMovie = async (token: string, tmdbId: number, rating: number) => {
  const res = await fetch(`${url}/movies/rate`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ tmdbId, rating }),
  });
  return res.json();
};


// Mark as Downloaded
export const markAsDownloaded = async (token: string, movieData: any) => {
  const res = await fetch(`${url}/movies/download`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(movieData),
  });
  return res.json();
};

// Add this to your API file
export const registerUser = async (userData: any) => {
  
  const response = await fetch(`${url}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    // This catches the exact errors we threw in our Express controller!
    throw new Error(data.error || 'Failed to register');
  }

  return data;
};


export const loginUser = async (credentials: any) => {
  
  const response = await fetch(`${url}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  
  if (!response.ok) {
    // Catches the "Invalid email or password" error from your backend
    throw new Error(data.error || 'Failed to log in');
  }

  return data;
};


export const requestPasswordReset = async (email: string) => {
  
  // Note: Adjust the endpoint path if your router uses something different!
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