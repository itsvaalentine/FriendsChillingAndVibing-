// src/components/OutlineButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const OutlineButton = ({ children, onPress, small }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, small && styles.smallButton]} 
      onPress={onPress}
    >
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: '#ff0000',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallButton: {
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  text: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
});

export default OutlineButton;