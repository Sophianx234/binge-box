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


// Upload Avatar to Backend
export const uploadAvatarToServer = async (token: string, imageUri: string) => {
  // 1. Create a FormData object
  const formData = new FormData();
  
  // 2. Extract the file extension and name from the URI
  const filename = imageUri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  // 3. Append the image (React Native requires this specific object structure)
  formData.append('avatar', {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // 4. Send it to Express!
  const res = await fetch(`${url}/users/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      // Note: We deliberately DO NOT set 'Content-Type' here. 
      // Fetch will automatically set it to 'multipart/form-data' with the correct boundary!
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload avatar');
  
  return data.user; // The backend returns the updated user object
};

export const fetchMovies = async (query?: string) => {
  try {
    // 1. Switch to 'multi' search and 'trending/all'
    const endpoint = query 
      ? `/search/multi?query=${encodeURIComponent(query)}` 
      : `/trending/all/week`; 

    const response = await fetch(`${tmdb_config.baseUrl}${endpoint}`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    const data = await response.json();

    // 2. TMDB 'multi' search also returns actors/directors. 
    // We filter them out so we only return playable media (Movies & TV).
    const filteredResults = data.results.filter(
      (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
    );

    return filteredResults; 

  } catch (error) {
    console.error('Error fetching media:', error);
    throw error; 
  }
};


export const fetchCredits = async (id: string | number, type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await fetch(`${tmdb_config.baseUrl}/${type}/${id}/credits`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) throw new Error('Failed to fetch credits');
    
    const data = await response.json();

    // 1. Get the Actors (Cast)
    // We slice(0, 10) so we only get the top 10 main actors, not the 50 background extras!
    const actors = data.cast?.slice(0, 10) || [];

    // 2. Get the Directors (Crew)
    // We filter the crew array to only find the people with the job title "Director"
    const directors = data.crew?.filter((member: any) => member.job === 'Director') || [];

    return { actors, directors };

  } catch (error) {
    console.error(`Error fetching ${type} credits:`, error);
    throw error;
  }
};

export const fetchGenres = async (type: 'movie' | 'tv' = 'movie') => {
  try {
    const response = await fetch(`${tmdb_config.baseUrl}/genre/${type}/list`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) throw new Error('Failed to fetch genres');
    
    const data = await response.json();
    return data.genres; // Returns an array like: [{ id: 28, name: "Action" }, ...]

  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    throw error;
  }
};

export const fetchSimilar = async (id: string | number, type: 'movie' | 'tv' = 'movie') => {
  try {
    // TMDB has both /similar and /recommendations. /recommendations usually gives better results!
    const response = await fetch(`${tmdb_config.baseUrl}/${type}/${id}/recommendations`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) throw new Error('Failed to fetch similar media');
    
    const data = await response.json();
    return data.results;

  } catch (error) {
    console.error(`Error fetching similar ${type}:`, error);
    throw error;
  }
};

export const fetchMovieDetails = async (id: string | string[], type: string = 'movie') => {
  try {
    // We replace the hardcoded '/movie/' with `/${type}/`
    const response = await fetch(`${tmdb_config.baseUrl}/${type}/${id}?append_to_response=videos,reviews`, {
      headers: tmdb_config.headers
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
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