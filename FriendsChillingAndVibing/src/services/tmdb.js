// src/services/tmdb.js
import axios from 'axios';

// La API key para TheMovieDB
const API_KEY = '7e71cd90f1fc8b35b9010963bc221d74'; // Necesitarás registrarte en themoviedb.org para obtener una clave

// URL base para las imágenes
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Función para buscar películas
export async function searchMovies(query) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=es-ES`
    );
    
    // Convertir el formato de respuesta para que sea compatible con tu código actual
    return response.data.results.map(movie => ({
      imdbID: movie.id.toString(),
      Title: movie.title,
      Poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image',
      Year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
    }));
  } catch (error) {
    console.error('Error al buscar películas:', error);
    return [];
  }
}

// Función para obtener detalles de una película
export async function getMovieDetails(id) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`
      );
  
      // Fetch watch providers
      const watchProvidersResponse = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=${API_KEY}`
      );
  
      const watchProviders = watchProvidersResponse.data.results?.ES || {}; // Replace 'ES' with your desired country code
  
      return {
        imdbID: response.data.id.toString(),
        Title: response.data.title,
        Year: response.data.release_date ? response.data.release_date.substring(0, 4) : 'N/A',
        Plot: response.data.overview,
        Poster: response.data.poster_path ? `${IMAGE_BASE_URL}${response.data.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Image',
        Runtime: `${response.data.runtime} min`,
        Genre: response.data.genres.map(g => g.name).join(', '),
        Director: 'N/A', // TMDB no tiene director directamente, necesitarías otra llamada
        imdbRating: response.data.vote_average.toString(),
        WatchProviders: {
          Streaming: watchProviders.flatrate?.map(provider => provider.provider_name) || [],
          Rent: watchProviders.rent?.map(provider => provider.provider_name) || [],
          Buy: watchProviders.buy?.map(provider => provider.provider_name) || []
        }
      };
    } catch (error) {
      console.error('Error al obtener detalles de la película:', error);
      return null;
    }
  }

// Categorías y tipos
export const category = {
    movie: 'movie',
    tv: 'tv'
  };
  
  export const movieType = {
    popular: 'popular',
    top_rated: 'top_rated',
    upcoming: 'upcoming'
  };
  
  export const tvType = {
    popular: 'popular',
    top_rated: 'top_rated',
    on_the_air: 'on_the_air'
  };
  
  // Obtener películas/series por categoría y tipo
  export async function getByCategory(category, type, page = 1) {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/${category}/${type}?api_key=${API_KEY}&language=es-ES&page=${page}`
      );
      
      return response.data.results.map(item => ({
        id: item.id.toString(),
        title: item.title || item.name,
        poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750',
        backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null,
        overview: item.overview,
        rating: item.vote_average,
        releaseDate: item.release_date || item.first_air_date
      }));
    } catch (error) {
      console.error(`Error al obtener ${category}/${type}:`, error);
      return [];
    }
  }
  
  // Obtener películas/series en tendencia
  export async function getTrending(mediaType = 'all', timeWindow = 'day') {
    try {
      const response = await axios.get(
        `https://api.themoviedb.org/3/trending/${mediaType}/${timeWindow}?api_key=${API_KEY}&language=es-ES`
      );
      
      return response.data.results.map(item => ({
        id: item.id.toString(),
        title: item.title || item.name,
        poster: item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750',
        backdrop: item.backdrop_path ? `${IMAGE_BASE_URL}${item.backdrop_path}` : null,
        overview: item.overview,
        rating: item.vote_average,
        mediaType: item.media_type,
        releaseDate: item.release_date || item.first_air_date
      }));
    } catch (error) {
      console.error('Error al obtener trending:', error);
      return [];
    }
  }

  export async function searchTV(query) {
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`
    );

    return {
      ok: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error al buscar series:', error);
    return { ok: false, error };
  }
}
