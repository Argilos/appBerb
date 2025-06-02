import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';

const Welcome = ({ navigation }) => {
  return (
    <ImageBackground 
      source={require('../assets/barbershop-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.shopName}>CLASSIC CUTS</Text>
        <Text style={styles.subtitle}>Premium Barbershop Experience</Text>

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Prijava</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={[styles.buttonText, styles.registerButtonText]}>
            Registracija
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    color: '#D4AF37',
    fontSize: 28,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  shopName: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#D4AF37',
    fontSize: 18,
    marginBottom: 50,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 45,
    paddingVertical: 18,
    borderRadius: 12,
    marginTop: 15,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
});

export default Welcome;
