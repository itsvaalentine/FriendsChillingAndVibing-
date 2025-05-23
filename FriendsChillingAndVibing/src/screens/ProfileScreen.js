import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Image, Alert, ImageBackground, ScrollView, FlatList
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [image, setImage] = useState(null);
  const navigation = useNavigation();

  const defaultImage = 'https://image.tmdb.org/t/p/w500/6aRPX1zSrzFJm3m0Md8MMzcyJxR.jpg';
  const backgroundImage = {
    uri: 'https://image.tmdb.org/t/p/w780/8riWcADI1ekEiBguVB9vkilhiQm.jpg',
  };

  const posters = [
    'https://image.tmdb.org/t/p/w500/6aRPX1zSrzFJm3m0Md8MMzcyJxR.jpg',
    'https://image.tmdb.org/t/p/w500/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    'https://image.tmdb.org/t/p/w500/8riWcADI1ekEiBguVB9vkilhiQm.jpg',
    'https://image.tmdb.org/t/p/w500/yOm993lsJyPmBodlYjgpPwBjXP9.jpg',
    'https://image.tmdb.org/t/p/w500/qZcO5iSRmB9dF9J0GqzBTHhp6qt.jpg',
  ];

  useEffect(() => {
    const loadData = async () => {
      const storedName = await AsyncStorage.getItem('username');
      const storedImage = await AsyncStorage.getItem('profileImage');
      if (storedName) {
        setName(storedName);
        setNewName(storedName);
      }
      if (storedImage) setImage(storedImage);
    };
    loadData();
  }, []);

  const saveName = async () => {
    try {
      await AsyncStorage.setItem('username', newName);
      setName(newName);
      setEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el nombre.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('profileImage');
    navigation.replace('LoginScreen');
  };

  const renderPosterOptions = () => (
    <FlatList
        data={posters}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ marginBottom: 20 }}
        renderItem={({ item }) => (
        <TouchableOpacity
            onPress={async () => {
            setImage(item);
            await AsyncStorage.setItem('profileImage', item);
            }}
            style={{
            marginHorizontal: 8,
            transform: [{ scale: image === item ? 1.05 : 1 }],
            shadowColor: image === item ? '#000' : 'transparent',
            shadowOpacity: image === item ? 0.5 : 0,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            }}
        >
            <Image
            source={{ uri: item }}
            style={{
                width: 100,
                height: 150,
                borderRadius: 12,
                opacity: image === item ? 1 : 0.8,
            }}
            />
        </TouchableOpacity>
        )}
    />
    );



  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(47, 29, 26, 0.85)' }}>
    <ImageBackground source={backgroundImage} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>👤 Perfil</Text>

        <Image
          source={{ uri: image || defaultImage }}
          style={styles.profileImage}
        />
        <Text style={styles.editPhoto}>Elige tu póster de perfil:</Text>
        {renderPosterOptions()}

        {editing ? (
          <>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Nuevo nombre"
              placeholderTextColor="#999"
            />
            <TouchableOpacity style={styles.button} onPress={saveName}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.name}>Nombre: {name || 'Cargando...'}</Text>
            <TouchableOpacity style={styles.button} onPress={() => setEditing(true)}>
              <Text style={styles.buttonText}>Cambiar nombre</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 29, 26, 0.85)',
  },
  header: {
    fontSize: 28,
    color: '#f5e8da',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileImage: {
    width: 160,
    height: 240,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  editPhoto: {
    color: '#f5e8da',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginBottom: 20,
  },
  name: {
    fontSize: 20,
    color: '#f5e8da',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    width: '80%',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#a87060',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
    padding: 10,
  },
  logoutText: {
    color: '#f08080',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
