import axios from 'axios';

const API_KEY = 'f2f40810'; // ← reemplaza con tu clave
const BASE_URL = 'https://www.omdbapi.com/';

export async function searchMovies(query) {
    try {
      const response = await axios.get(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
      return response.data.Search || [];
    } catch (error) {
      console.error('Error al buscar películas:', error);
      return [];
    }

}

export const getMovieDetails = async (id) => {
  try {
    console.time()
    const response = await axios.get(BASE_URL, {
      params: {
        i: id,         // 'tt1234567', etc.
        apikey: API_KEY,
      },
    });
    console.timeEnd()
    return response.data; // Devuelve detalles de la película
  } catch (error) {
    console.error('Error al obtener detalles de la película:', error);
    return null;
  }
};