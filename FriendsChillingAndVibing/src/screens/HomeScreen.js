import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { getByCategory, getTrending, getMovieDetails, searchMovies, category, movieType, tvType } from '../services/tmdb';
import { Modal } from 'react-native';


// Componente de Header
const Header = ({ navigation, onSearch, setShowLoginModal  }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  


  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery); // <-- ¡ya no setShowLoginModal aquí!
    }
  };






  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.appName}>Friend'&Chill</Text>
      </View>
      
      <View style={styles.headerRight}>
        {showSearch ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar películas y series..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              onPress={handleSearch}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.searchButton} 
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.closeSearchButton} 
              onPress={() => setShowSearch(false)}
            >
              <Text style={styles.closeSearchText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => setShowSearch(true)}
            >
              <Text style={styles.iconText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.loginButton} 
              onPress={() => navigation.navigate('LoginScreen')}
            >
              <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

// Componente de película con hover
const MovieItem = ({ item, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [details, setDetails] = useState(null);

  const handleHoverIn = async () => {
    setIsHovered(true);
    if (!details) {
      const movieDetails = await getMovieDetails(item.id);
      setDetails(movieDetails);
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      onLongPress={handleHoverIn}
      
    >

      <Image 
        source={{ uri: item.poster }} 
        style={styles.poster}
      />
      <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</Text>
      
      {isHovered && details && (
        <View style={styles.hoverCard}>
          <Text style={styles.hoverTitle}>{details.Title}</Text>
          <Text style={styles.hoverYear}>{details.Year}</Text>
          <Text style={styles.hoverDescription} numberOfLines={3}>
            {details.Plot}
          </Text>
          {details.Genre && (
            <Text style={styles.hoverGenre}>{details.Genre}</Text>
          )}
          {details.Runtime && (
            <Text style={styles.hoverRuntime}>{details.Runtime}</Text>
          )}
          {details.WatchProviders && details.WatchProviders.Streaming && 
          details.WatchProviders.Streaming.length > 0 && (
            <View>
              <Text style={styles.hoverProvidersTitle}>Streaming en:</Text>
              <Text style={styles.hoverProviders}>
                {details.WatchProviders.Streaming.join(', ')}
              </Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};


// Componente de lista horizontal sin botón "Ver más"
const MovieListRow = ({ title, data, navigation, category }) => (
  <View style={styles.sectionContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {data.map(item => (
        <MovieItem 
          key={item.id} 
          item={item} 
          onPress={() => navigation.navigate('Detail', { id: item.id, category })}
        />
      ))}
    </ScrollView>
  </View>
);

// Componente Hero con hover
const HeroSlide = ({ movie, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <TouchableOpacity 
      style={styles.heroContainer} 
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        source={{ uri: movie.backdrop || movie.poster }}
        style={styles.heroBackdrop}
      />
      <View style={[
        styles.heroOverlay, 
        isHovered && styles.heroOverlayHovered
      ]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{movie.title}</Text>
          <Text style={styles.heroOverview} numberOfLines={isHovered ? 4 : 2}>
            {movie.overview}
          </Text>
          <View style={styles.heroRatingContainer}>
            <Text style={styles.heroRating}>⭐ {movie.rating?.toFixed(1) || 'N/A'}</Text>
          </View>
          
          
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen({ navigation }) {
  const [trendingMovies, setTrendingMovies] = React.useState([]);
  const [popularMovies, setPopularMovies] = React.useState([]);
  const [topRatedMovies, setTopRatedMovies] = React.useState([]);
  const [popularTV, setPopularTV] = React.useState([]);
  const [topRatedTV, setTopRatedTV] = React.useState([]);
  const [searchResults, setSearchResults] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showLoginModal, setShowLoginModal] = React.useState(false);


  React.useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Fetch trending for hero
      const trending = await getTrending('movie', 'week');
      setTrendingMovies(trending.slice(0, 5));
      
      // Fetch section data
      const popular = await getByCategory(category.movie, movieType.popular);
      setPopularMovies(popular);
      
      const topRated = await getByCategory(category.movie, movieType.top_rated);
      setTopRatedMovies(topRated);
      
      const popTV = await getByCategory(category.tv, tvType.popular);
      setPopularTV(popTV);
      
      const topTV = await getByCategory(category.tv, tvType.top_rated);
      setTopRatedTV(topTV);
      
      setSearchResults(null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query) => {

    if (!query || query.trim().length === 0) return;

    setShowLoginModal(true);
    // setIsLoading(true);
    // try {
    //   const results = await searchMovies(query);
    //   setSearchResults(results);
    // } catch (error) {
    //   console.error('Error searching:', error);
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { marginTop: 0 }]}>
      {/* Header with search and login */}
      <Header 
        navigation={navigation} 
        onSearch={handleSearch}
        setShowLoginModal={setShowLoginModal}
      />
      <Modal
        visible={showLoginModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLoginModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Inicia esta aventura iniciando sesión</Text>
            <Text style={styles.modalText}>
              Para encontrar tu selección personalizada de películas
            </Text>

            <TouchableOpacity
              style={styles.modalButtonPrimary}
              onPress={() => {
                setShowLoginModal(false);
                navigation.navigate('LoginScreen');
              }}
            >
              <Text style={styles.modalButtonText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={() => setShowLoginModal(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView>
        {searchResults ? (
          // Search results view
          <View style={styles.searchResultsContainer}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchResultsTitle}>Resultados de búsqueda</Text>
              <TouchableOpacity onPress={fetchInitialData}>
                <Text style={styles.clearSearchText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => navigation.navigate('Detail', { 
                      id: item.id, 
                      category: item.media_type || category.movie 
                    })}
                  >
                    <Image
                      source={{ uri: item.poster }}
                      style={styles.searchItemPoster}
                    />
                    <View style={styles.searchItemInfo}>
                      <Text style={styles.searchItemTitle}>{item.title}</Text>
                      <Text style={styles.searchItemYear}>
                        {item.release_date ? item.release_date.substring(0, 4) : 'N/A'}
                      </Text>
                      <Text style={styles.searchItemRating}>
                        ⭐ {item.rating?.toFixed(1) || 'N/A'}
                      </Text>
                      {item.overview && (
                        <Text style={styles.searchItemOverview} numberOfLines={2}>
                          {item.overview}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noResultsText}>
                  No se encontraron resultados. Intenta con otra búsqueda.
                </Text>
              )}
            </View>
          </View>
        ) : (
          // Home content
          <>
            {/* Hero Slide */}
            {trendingMovies.length > 0 && (
              <HeroSlide 
                movie={trendingMovies[0]} 
                onPress={() => navigation.navigate('Detail', { id: trendingMovies[0].id, category: 'movie' })}
              />
            )}
            
            {/* Películas Populares */}
            <MovieListRow
              title="Películas Populares"
              data={popularMovies}
              navigation={navigation}
              category={category.movie}
            />
            
            {/* Películas Mejor Valoradas */}
            <MovieListRow
              title="Películas Mejor Valoradas"
              data={topRatedMovies}
              navigation={navigation}
              category={category.movie}
            />
            
            {/* Series Populares */}
            <MovieListRow
              title="Series Populares"
              data={popularTV}
              navigation={navigation}
              category={category.tv}
            />
            
            {/* Series Mejor Valoradas */}
            <MovieListRow
              title="Series Mejor Valoradas"
              data={topRatedTV}
              navigation={navigation}
              category={category.tv}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F3330',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3F3330',
  },
  loadingText: {
    color: '#F1E9DC',
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#3F3330',
    borderBottomWidth: 1,
    borderBottomColor: '#A89B8B',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    color: '#C5B08C',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginRight: 15,
  },
  iconText: {
    color: '#F1E9DC',
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#C5B08C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#3A2A23',
    fontWeight: 'bold',
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#A89B8B',
    borderRadius: 18,
    color: '#3A2A23',
    paddingHorizontal: 15,
    marginRight: 10,
  },
  searchButton: {
    marginRight: 10,
  },
  searchButtonText: {
    color: '#F1E9DC',
    fontSize: 16,
  },
  closeSearchButton: {
    padding: 5,
  },
  closeSearchText: {
    color: '#A89B8B',
    fontSize: 16,
  },
  searchResultsContainer: {
    padding: 15,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  searchResultsTitle: {
    color: '#F1E9DC',
    fontSize: 22,
    fontWeight: 'bold',
  },
  clearSearchText: {
    color: '#C5B08C',
    fontSize: 14,
  },
  searchResults: {
    marginTop: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#5C4434',
    borderRadius: 8,
    overflow: 'hidden',
  },
  searchItemPoster: {
    width: 100,
    height: 150,
  },
  searchItemInfo: {
    flex: 1,
    padding: 12,
  },
  searchItemTitle: {
    color: '#F1E9DC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchItemYear: {
    color: '#C5B08C',
    fontSize: 14,
    marginBottom: 6,
  },
  searchItemRating: {
    color: '#E0C97C',
    fontSize: 14,
    marginBottom: 8,
  },
  searchItemOverview: {
    color: '#DDD0C0',
    fontSize: 13,
    lineHeight: 18,
  },
  noResultsText: {
    color: '#DDD0C0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  heroContainer: {
    height: 300,
    width: '100%',
    marginBottom: 20,
    position: 'relative',
  },
  heroBackdrop: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(63,51,48,0.85)',
    justifyContent: 'flex-end',
    transition: 'all 0.3s ease',
  },
  heroOverlayHovered: {
    backgroundColor: 'rgba(63,51,48,0.95)',
  },
  heroContent: {
    padding: 20,
  },
  heroTitle: {
    color: '#F1E9DC',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heroOverview: {
    color: '#DDD0C0',
    fontSize: 14,
    marginBottom: 15,
    transition: 'all 0.3s ease',
  },
  heroRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  heroRating: {
    color: '#E0C97C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  watchButton: {
    backgroundColor: '#C5B08C',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    color: '#3A2A23',
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    color: '#F1E9DC',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  item: {
    marginRight: 10,
    width: 120,
    position: 'relative',
    transition: 'all 0.3s ease',
    zIndex: 1,
  },
  itemHovered: {
    transform: [{ translateY: -5 }],
    zIndex: 2,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  itemTitle: {
    color: '#F1E9DC',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  rating: {
    color: '#E0C97C',
    fontSize: 12,
    marginTop: 2,
  },
  hoverCard: {
    backgroundColor: '#5C4434',
    padding: 10,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  hoverCardTitle: {
    color: '#F1E9DC',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hoverTitle: {
    color: '#F1E9DC',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  hoverYear: {
    color: '#A89B8B',
    fontSize: 12,
    marginBottom: 8,
  },
  hoverDescription: {
    color: '#DDD0C0',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  hoverGenre: {
    color: '#A89B8B',
    fontSize: 11,
    marginBottom: 4,
  },
  hoverRuntime: {
    color: '#A89B8B',
    fontSize: 11,
    marginBottom: 8,
  },
  hoverProvidersTitle: {
    color: '#C5B08C',
    fontSize: 11,
    marginBottom: 2,
  },
  hoverProviders: {
    color: '#C5B08C',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#F1E9DC',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#5C4434',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    color: '#3A2A23',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonPrimary: {
    backgroundColor: '#C5B08C',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButtonSecondary: {
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  modalButtonText: {
    color: '#3A2A23',
    fontWeight: 'bold',
  },
  modalButtonTextSecondary: {
    color: '#A89B8B',
    fontWeight: 'bold',
  },
});