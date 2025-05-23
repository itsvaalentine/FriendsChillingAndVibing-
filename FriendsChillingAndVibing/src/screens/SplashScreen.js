import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        navigation.replace('HomeScreen'); // 👈 Ir directo si hay token
      } else {
        navigation.replace('LoginScreen'); // 👈 Si no hay, va a login
      }
    };

    checkToken();
  }, []);

  return (
    <View>
      <Text>Cargando...</Text>
    </View>
  );
}
