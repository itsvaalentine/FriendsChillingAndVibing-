import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CustomButton from '../components/CustomButton';
import InputField from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import { register } from '../services/auth'; // Asegúrate de tener esta función en tu backend

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    setError('');

    if (!username || !email || !password || !confirmPassword) {
        setError('Todos los campos son obligatorios.');
        return;
    }

    if (!validateEmail(email)) {
        setError('Ingresa un correo válido.');
        return;
    }

    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    setLoading(true);

    try {
        const response = await register(username, email, password);
        const data = await response.json(); // intentamos leer la respuesta del backend

        if (response.ok) {
        // Puedes mostrar un mensaje si quieres antes de redirigir
        // alert(data.message || 'Registro exitoso');
        navigation.replace('LoginScreen');
        } else {
        setError(data.message || 'No se pudo registrar el usuario.');
        }
    } catch (err) {
        console.error('RegisterScreen - Error:', err.message);
        setError('Error al registrarse. Intenta de nuevo.');
    } finally {
        setLoading(false);
    }
};


  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.logoContainer}>
        <View style={styles.overlayText}>
          <Text style={styles.textStyle}>Friends</Text>
          <Text style={styles.textStyle}>&</Text>
          <Text style={styles.textStyle}>Chill</Text>
        </View>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>

      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.title}>Crear Cuenta</Text>

          <InputField value={username} onChangeText={setUsername} placeholder="Username" />
          <InputField value={email} onChangeText={setEmail} placeholder="Email" />
          <PasswordInput value={password} onChangeText={setPassword} placeholder="Contraseña" />
          <PasswordInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirmar contraseña" />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {loading ? (
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color="#6b4c3b" />
            </View>
          ) : (
            <CustomButton title="Registrarse" onPress={handleRegister} />
          )}

          <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? Inicia sesión</Text>
          </TouchableOpacity>
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
    top: '25%',
    left: 10,
    textAlign: 'left',
    zIndex: 2,
  },
  textStyle: {
    left: 10,
    textAlign: 'left',
    color: '#e5caac',
    fontSize: 32,
    fontWeight: 'bold',
    zIndex: 2,
  },
  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 0.75,
    backgroundColor: '#f5f0e1',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 10,
    marginTop: -40,
  },
  innerContainer: {
    flexGrow: 0,
    justifyContent: 'center',
    paddingTop: 10,   // puedes probar con 0 si aún se ve lejos
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    color: '#6b4c3b',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#a94442',
    fontSize: 14,
    marginTop: -5,
    marginBottom: 10,
    marginLeft: 5,
  },
  loginText: {
    marginTop: 20,
    color: '#6b4c3b',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  spinnerContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
