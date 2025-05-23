import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBar({ onSearch, onReload }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query.trim());
  };

  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#ccc" />
      <TextInput
        style={styles.input}
        placeholder="Buscar películas y series..."
        placeholderTextColor="#ccc"
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      {/* <TouchableOpacity onPress={onReload}>
        <Ionicons name="reload" size={22} color="#ffcc00" />
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#3a2d2a',
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    margin: 10,
  },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    color: '#fff',
    fontSize: 16,
  },
});
