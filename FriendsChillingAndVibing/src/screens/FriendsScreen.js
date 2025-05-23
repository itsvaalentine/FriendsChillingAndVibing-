import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, FlatList, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import Roulette from '../components/Roulette'; // Ajusta el path si es necesario
import Modal from 'react-native-modal';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


export default function FriendsScreen() {
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showRoulette, setShowRoulette] = useState(false);

  const STORAGE_KEY = '@friends_list';

  useEffect(() => {
    const loadFriends = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) setFriends(JSON.parse(stored));
      } catch (err) {
        console.error('Error loading friends:', err);
      }
    };
    loadFriends();
  }, []);

  useEffect(() => {
    const saveFriends = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(friends));
      } catch (err) {
        console.error('Error saving friends:', err);
      }
    };
    saveFriends();
  }, [friends]);

  const addFriend = () => {
    if (!newName.trim()) return Alert.alert('Falta nombre');
    const newFriend = {
      id: Date.now().toString(),
      name: newName,
      avatar: newAvatar || 'https://placekitten.com/100/100',
      lastMessage: newMessage || 'Start a new conversation',
    };
    setFriends(prev => [...prev, newFriend]);
    setNewName('');
    setNewAvatar('');
    setNewMessage('');
  };

  const deleteFriend = (id) => {
    setFriends(prev => prev.filter(friend => friend.id !== id));
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => deleteFriend(id)}
    >
      <Ionicons name="trash-outline" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View style={styles.friendItem}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
          <Text style={styles.friendMessage}>{item.lastMessage}</Text>
        </View>
        <Ionicons name="chatbubble-outline" size={24} color="#ccc" />
      </View>
    </Swipeable>
  );

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>friends</Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#aaa" />
        <TextInput
          placeholder="Search for friends"
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <Text style={styles.sectionTitle}>ADD FRIEND</Text>
      <View style={styles.addForm}>
        <TextInput
          placeholder="Name"
          placeholderTextColor="#999"
          value={newName}
          onChangeText={setNewName}
          style={styles.input}
        />
        {/* <TextInput
          placeholder="Avatar URL (optional)"
          placeholderTextColor="#999"
          value={newAvatar}
          onChangeText={setNewAvatar}
          style={styles.input}
        /> */}
        <TextInput
          placeholder="Message (optional)"
          placeholderTextColor="#999"
          value={newMessage}
          onChangeText={setNewMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.addButton} onPress={addFriend}>
          <Text style={styles.addButtonText}>+ Add Friend</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>FRIENDS</Text>
      <FlatList
        data={filteredFriends}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.rouletteButton}
        onPress={() => setShowRoulette(true)}
      >
        <Text style={styles.rouletteButtonText}>🎲 Abrir Ruleta</Text>
      </TouchableOpacity>

      <Modal
        isVisible={showRoulette}
        onBackdropPress={() => setShowRoulette(false)}
        style={{ margin: 0 }}
        useNativeDriver
        backdropOpacity={0.7}
        >
        <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
            <Roulette closeModal={() => setShowRoulette(false)} />
        </View>
        </Modal>



    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F3330',
    padding: 20,
    paddingTop: 50,
  },
  title: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    textTransform: 'lowercase',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 10,
    height: 40,
  },
  searchInput: {
    marginLeft: 8,
    color: '#fff',
    flex: 1,
  },
  sectionTitle: {
    color: '#f5e1b7',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  addForm: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#e5caac',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  addButtonText: {
    color: '#3a2c1a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    backgroundColor: '#222',
    borderRadius: 10,
    marginBottom: 8,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendMessage: {
    color: '#aaa',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#ce4257',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  rouletteButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#e5caac',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rouletteButtonText: {
    color: '#3a2c1a',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
