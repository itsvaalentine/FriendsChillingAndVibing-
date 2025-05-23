import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Animated, FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getMovieDetails,
  getTrending,
  searchMovies
} from '../services/tmdb';

export default function MainScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [watchlists, setWatchlists] = useState({});
  const [customListModalVisible, setCustomListModalVisible] = useState(false);
  const [customListName, setCustomListName] = useState('');
  const [selectListModalVisible, setSelectListModalVisible] = useState(false);
  const [movieToAdd, setMovieToAdd] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const toastOpacity = useState(new Animated.Value(0))[0];
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [trendingMoviesNow, setTrendingMoviesNow] = useState([]);
  const [trendingTVNow, setTrendingTVNow] = useState([]);
  const [isLoading, setIsLoading] = useState(false);




  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const trendingNowMovies = await getTrending('movie', 'day');
      const trendingNowTV = await getTrending('tv', 'day');
      console.log('Trending TV:', trendingNowTV);
      console.log('Trending Movies:', trendingNowMovies);

      const formatItem = (item, isTV = false) => ({
        id: item.id,
        title: isTV ? item.name : item.title,
        poster: item.poster
          ? `https://image.tmdb.org/t/p/w500${item.poster}`
          : 'https://via.placeholder.com/300x450?text=No+Image',
        mediaType: isTV ? 'tv' : 'movie',
      });

      setTrendingMoviesNow(trendingNowMovies.map(m => formatItem(m, false)));
      setTrendingTVNow(trendingNowTV.map(m => ({
        id: m.id,
        title: m.name,
        poster: m.poster
          ? `https://image.tmdb.org/t/p/w500${m.poster}`
          : 'https://via.placeholder.com/300x450?text=No+Image',
        mediaType: 'tv'
      })));

      setSearchResults([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchInitialData();
  }, []);




  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    const movies = await searchMovies(searchQuery);
    const formatted = movies.map(m => ({
      id: m.imdbID,
      title: m.Title,
      poster: m.Poster,
    }));
    setSearchResults(formatted);
  };

  const openModal = async (movie) => {
    try {
      const details = await getMovieDetails(movie.id, movie.mediaType || 'movie');
      setSelectedMovie(details);
      setShowMovieModal(true);
    } catch (error) {
      console.error('Error al cargar detalles de la película:', error);
    }
  };


  const handleAddToList = (movie, listName) => {
    setWatchlists(prev => {
      const updated = { ...prev };
      if (!updated[listName]) updated[listName] = [];
      const exists = updated[listName].some(m => m.id === movie.id);
      if (!exists) updated[listName].push(movie);
      return updated;
    });

    setFeedbackMessage(`${movie.title} agregado a "${listName}"`);
    toastOpacity.setValue(0);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setFeedbackMessage(''));
    }, 2500);
  };

  const renderMovie = ({ item }) => {
    const alreadyInList = Object.values(watchlists).flat().some(m => m.id === item.id);
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => openModal(item)}>
          <Image source={{ uri: item.poster }} style={styles.poster} />
        </TouchableOpacity>
        {!alreadyInList && (
          <TouchableOpacity
            style={styles.addIcon}
            onPress={() => {
              setMovieToAdd(item);
              setSelectListModalVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
      </View>
    );
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      fetchInitialData();
    }
  }, [searchQuery]);


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>🎬 Friends&Chill</Text>
        <TouchableOpacity onPress={() => setCustomListModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={26} color="#f5e8da" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#d6b58c" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar películas..."
          placeholderTextColor="#d6b58c"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      {searchResults.length > 0 && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          horizontal
          renderItem={renderMovie}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {trendingMoviesNow.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎞 Películas del momento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {trendingMoviesNow.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => openModal(item)}>
                    <Image source={{ uri: item.poster }} style={styles.poster} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}


          {trendingTVNow.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📺 Series del momento</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {trendingTVNow.map(item => (
                  <TouchableOpacity key={item.id} onPress={() => openModal(item)}>
                    <Image source={{ uri: item.poster }} style={styles.poster} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )} 

        {Object.keys(watchlists).map((listName, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.sectionTitle}>{listName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {watchlists[listName].map(item => (
                <View key={item.id} style={styles.itemContainer}>
                  <TouchableOpacity onPress={() => openModal(item)}>
                    <Image source={{ uri: item.poster }} style={styles.poster} />
                  </TouchableOpacity>
                  <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>

      {feedbackMessage !== '' && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}> 
          <Text style={styles.toastText}>{feedbackMessage}</Text>
        </Animated.View>
      )}

      {/* Modal para crear listas */}
      <Modal visible={customListModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.customListModal}>
            <Text style={styles.modalTitle}>Nueva lista</Text>
            <TextInput
              placeholder="Nombre de la lista"
              placeholderTextColor="#ccc"
              style={styles.input}
              value={customListName}
              onChangeText={setCustomListName}
            />
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (customListName.trim()) {
                  setWatchlists(prev => ({ ...prev, [customListName]: [] }));
                }
                setCustomListModalVisible(false);
                setCustomListName('');
              }}
            >
              <Text style={styles.modalButtonText}>Crear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para elegir lista */}
      <Modal visible={selectListModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.customListModal}>
            <Text style={styles.modalTitle}>¿A qué lista quieres agregarlo?</Text>
            {Object.keys(watchlists).map((listName, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.modalButton}
                onPress={() => {
                  handleAddToList(movieToAdd, listName);
                  setSelectListModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>{listName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMovieModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMovieModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.customListModal, { alignItems: 'flex-start' }]}>
            {selectedMovie && (
              <>
                <Image
                  source={{ uri: selectedMovie.Poster }}
                  style={{ width: '100%', height: 250, borderRadius: 8, marginBottom: 10 }}
                  resizeMode="cover"
                />
                <Text style={{ color: '#f5e8da', fontSize: 18, fontWeight: 'bold' }}>{selectedMovie.Title}</Text>
                <Text style={{ color: '#d6b58c', marginVertical: 4 }}>{selectedMovie.Year}</Text>
                <Text style={{ color: '#fff', marginBottom: 10 }}>{selectedMovie.Plot}</Text>
                <Text style={{ color: '#d6b58c' }}>{selectedMovie.Genre}</Text>
                <Text style={{ color: '#d6b58c' }}>{selectedMovie.Runtime}</Text>
                {selectedMovie.WatchProviders?.Streaming?.length > 0 && (
                  <>
                    <Text style={{ color: '#d6b58c', marginTop: 10 }}>Disponible en:</Text>
                    <Text style={{ color: '#f5e8da' }}>{selectedMovie.WatchProviders.Streaming.join(', ')}</Text>
                  </>
                )}
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: '#805b4e', marginTop: 15 }]}
                  onPress={() => setShowMovieModal(false)}
                >
                  <Text style={styles.modalButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F3330',
    padding: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  header: {
    color: '#f5e8da',
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b2a28',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#f5e8da',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#f5e8da',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  itemContainer: {
    marginRight: 10,
    width: 120,
    alignItems: 'center',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 10,
  },
  itemTitle: {
    color: '#f5e8da',
    fontSize: 12,
    marginTop: 5,
  },
  addIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#2f1d1a',
    borderRadius: 12,
    padding: 2,
  },
  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#3b2a28',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  toastText: {
    color: '#f5e8da',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customListModal: {
    width: '85%',
    backgroundColor: '#3F3330',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#a18677',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});