import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import { login } from '../services/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState('');

  const handleLogin = async () => {
    try {
      console.log("LoginScreen - Attempting login with:", email, password);

      const { response, data } = await login(email, password); // 👈 uso del servicio

      if (response.ok) {
        setLoginStatus('success');
        navigation.replace('MainScreen');
      } else {
        setLoginStatus('fail');
      }
    } 
    catch (error) {
      setLoginStatus('error');
      console.error('LoginScreen - Login error caught:', error.message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Logo centrado */}
      <View style={styles.logoContainer}>
        <View style={styles.overlayText}>
          <Text style={styles.textStyle}>Friends</Text>
          <Text style={styles.textStyle}>&</Text>
          <Text style={styles.textStyle}>Chill</Text>
        </View>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
        />
      </View>

      {/* Caja de Login con esquinas redondeadas */}
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Iniciar Sesión</Text>

          <InputField
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
          />
          <InputField
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />

          <CustomButton
            title="Entrar"
            onPress={handleLogin}
          />

          <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
            <Text style={{ textAlign: 'center', marginTop: 15, color: '#6b4c3b', textDecorationLine: 'underline' }}>
              ¿No tienes cuenta? Regístrate
            </Text>
          </TouchableOpacity>
          
          {loginStatus === 'success' && (
            <Text style={{ color: 'green', textAlign: 'center', marginTop: 10 }}>
              Inicio de sesión exitoso 🎉
            </Text>
          )}
          {loginStatus === 'fail' && (
            <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
              Email o contraseña incorrectos.
            </Text>
          )}
          {loginStatus === 'error' && (
            <Text style={{ color: 'orange', textAlign: 'center', marginTop: 10 }}>
              Error al conectar con el servidor.
            </Text>
          )}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    flex: 0.45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  overlayText: {
    position: 'absolute',
    top: '35%',
    left: 10,
    zIndex: 2,
    // 🔴 quita estilos de texto como estos:
    // color: '#e5caac',
    // fontSize: 32,
    // fontWeight: 'bold',
  },  
  textStyle: {
    textAlign: 'left',
    color: '#e5caac',
    fontSize: 32,
    fontWeight: 'bold',
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },  
  container: {
    flex: 0.75,
    backgroundColor: '#f5f0e1',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
    marginTop: -40, // 👈 Esto hace que suba encima del logo
  },
  
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#6b4c3b',
    fontWeight: 'bold',
  },
});