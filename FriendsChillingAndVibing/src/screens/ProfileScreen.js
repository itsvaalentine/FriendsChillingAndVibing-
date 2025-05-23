import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FriendsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>👥 Amigos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2f1d1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#f5e8da',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
