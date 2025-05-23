// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig.extra.API_URL;

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      await AsyncStorage.setItem('token', data.token); // 👈 guarda token
    }

    return { response, data };
  } catch (error) {
    throw new Error('Error de red al intentar iniciar sesión');
  }
};

export const register = async ( username, email, password) => {
  try {
    console.log(`${API_URL}/api/users/register`);
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      await AsyncStorage.setItem('token', data.token); // 👈 guarda token
    }

    return { response, data };
  } catch (error) {
    throw new Error('Error de red al intentar iniciar sesión');
  }
};