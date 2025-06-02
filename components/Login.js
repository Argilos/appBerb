import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Molimo popunite sva polja');
      return;
    }

    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (!userDoc.exists()) {
        Alert.alert('Error', 'Korisnički račun ne postoji');
        return;
      }

      // Navigation will be handled by AuthContext
    } catch (error) {
      Alert.alert('Error', 'Pogrešan email ili lozinka');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="#666"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />
      <TouchableOpacity 
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading...' : 'Login'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#D4AF37',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333',
    padding: 18,
    marginBottom: 20,
    borderRadius: 12,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#1A1A1A',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#D4AF37',
    textAlign: 'center',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
});

export default Login;
