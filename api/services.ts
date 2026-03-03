const tmdb_config = {
  baseUrl: 'https://api.themoviedb.org/3', 
  // We don't need the short API Key at all if we use the Access Token!
  headers: {
    accept: 'application/json',
    // Make sure this points to the long Access Token, not the short API Key
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_TMDB_API_RAT}` 
  }
};

 

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


export const fetchMovieDetails = async (movieId: string | string[]) => {
  try {
    const response = await fetch(`${tmdb_config.baseUrl}/movie/${movieId}`, {
      headers: tmdb_config.headers
    });

    if (!response.ok) {
      throw new Error(`TMDB API Error: ${response.status}`);
    }

    return await response.json();
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