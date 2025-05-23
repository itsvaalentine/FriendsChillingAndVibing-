import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { getByCategory } from '../services/tmdb';

const MovieList = ({ category, type, navigation }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const results = await getByCategory(category, type);
      setItems(results);
    };

    fetchItems();
  }, [category, type]);

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.item}
      onPress={() => navigation.navigate('Detail', { id: item.id, category })}
    >
      <Image 
        source={{ uri: item.poster }} 
        style={styles.poster}
      />
      <Text style={styles.rating}>⭐ {item.rating.toFixed(1)}</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  item: {
    marginRight: 10,
    width: 120,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
  },
  rating: {
    color: '#ffcc00',
    fontSize: 12,
    marginTop: 5,
  },
});

export default MovieList;