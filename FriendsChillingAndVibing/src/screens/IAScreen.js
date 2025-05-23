import Constants from 'expo-constants';
import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomButton from '../components/CustomButton';

const API_URL = Constants.expoConfig.extra.API_URL;

const IAScreen = () => {
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const emotionToGenres = {
    joy: [35, 16, 10751, 10402],         // Comedia, Animación, Familia, musica
    sadness: [18, 10749],         // Drama, Romance
    anger: [28, 80, 53, 36],          // Acción, Crimen, Suspenso, historia
    fear: [27, 9648, 53],             // Terror, Misterio, Suspenso
    surprise: [14, 878, 12],      // Fantasía, Ciencia ficción, Aventura
    disgust: [99, 10752,10749, 18]   // Documental, guerra,Romance, Drama
    };


    const API_KEY = '7e71cd90f1fc8b35b9010963bc221d74';
    const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

    async function recomendarPeliculaPorEmociones(emocion1, emocion2) {
        const generos1 = emotionToGenres[emocion1.toLowerCase()] || [];
        const generos2 = emotionToGenres[emocion2.toLowerCase()] || [];
        const generosCombinados = [...new Set([...generos1, ...generos2])];

        if (generosCombinados.length === 0) return null;

        const urlBase = "https://api.themoviedb.org/3/discover/movie";
        const fetchPeliculas = async (generos, intentoSoloPrimaria = false) => {
            const url = `${urlBase}?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc&with_genres=${generos.join(',')}`;
            try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al consultar la API TMDB");
            const data = await response.json();
            const peliculas = (data.results || []).filter(p => p.overview);
            if (peliculas.length === 0) {
                console.debug(`🔍 No se encontraron películas con géneros: [${generos.join(',')}]`);
                return null;
            }

            const aleatoria = peliculas[Math.floor(Math.random() * peliculas.length)];
            return {
                id: aleatoria.id.toString(),
                title: aleatoria.title,
                overview: aleatoria.overview,
                vote_average: aleatoria.vote_average,
                poster: aleatoria.poster_path
                ? `${IMAGE_BASE_URL}${aleatoria.poster_path}`
                : "https://via.placeholder.com/300x450?text=No+Image"
            };
            } catch (error) {
            console.error("❌ Error al consultar la API TMDB:", error);
            return null;
            }
        };

        // Primer intento: combinación de emociones
        let resultado = await fetchPeliculas(generosCombinados);
        if (resultado) return resultado;

        // Segundo intento: solo emoción principal
        console.debug("🔁 Reintentando solo con la emoción principal:", emocion1);
        return await fetchPeliculas(generos1, true);
        }



  const handlePredict = async () => {
    if (!texto.trim()) return;
    setLoading(true);
    setResultado(null);
    setError('');
    console.log(texto)
    try {
      const response = await fetch(`${API_URL}/api/emotion/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto })
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');

      const data = await response.json();
      const emocion1 = data.emociones?.[0]?.nombre || '';
      const emocion2 = data.emociones?.[1]?.nombre || emocion1;
      const pelicula = await recomendarPeliculaPorEmociones(emocion1, emocion2);


      console.log(pelicula)
      setResultado({
        ...data,
        pelicula_recomendada: pelicula,
      });
    } catch (err) {
      console.error(err);
      setError('Error al obtener recomendación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🎭 Recomendación por emociones</Text>
        <TextInput
          style={styles.input}
          placeholder="¿Qué quieres ver?"
          value={texto}
          onChangeText={setTexto}
          placeholderTextColor="#ccc"
        />
        <CustomButton title="Obtener recomendación" onPress={handlePredict} />

        {loading && <ActivityIndicator size="large" color="#a18677" style={{ marginTop: 20 }} />}

        {resultado && (
          <View style={styles.resultado}>
            <Text style={styles.resultTitle}>Emociones detectadas:</Text>
            {Array.isArray(resultado.emociones) && resultado.emociones.map((e, i) => (
              <Text key={i} style={styles.text}>• {e.nombre} ({e.confianza})</Text>
            ))}

            {resultado.pelicula_recomendada ? (
              <>
                <Text style={styles.text}>🎞 Título: {resultado.pelicula_recomendada.title}</Text>
                <Text style={styles.resultTitle}>🎬 Película recomendada:</Text>
                <Text style={styles.text}>Overview: {resultado.pelicula_recomendada.overview}</Text>
                <Text style={styles.text}>⭐ Rating: {resultado.pelicula_recomendada.vote_average}</Text>
                {resultado.pelicula_recomendada.poster && (
                    <Image
                        source={{ uri: resultado.pelicula_recomendada.poster }}
                        style={styles.poster}
                    />
                    )}
              </>
            ) : (
              <Text style={styles.text}>😢 No se encontró una película con esas emociones.</Text>
            )}
          </View>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#3F3330',
    flexGrow: 1
  },
  title: {
    fontSize: 22,
    color: '#f5e8da',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    color: '#000'
  },
  resultado: {
    marginTop: 20,
    backgroundColor: '#4e3e38',
    padding: 15,
    borderRadius: 10
  },
  resultTitle: {
    color: '#f5e8da',
    fontWeight: 'bold',
    marginTop: 10
  },
  text: {
    color: '#f5e8da',
    marginTop: 4
  },
  error: {
    color: '#ffcccc',
    marginTop: 15,
    textAlign: 'center'
  },
  poster: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginTop: 15,
    resizeMode: 'cover',
  }
});

export default IAScreen;
