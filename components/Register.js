import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

function Register({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Molimo popunite sva polja');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Lozinke se ne podudaraju');
      return;
    }

    if (phone.length < 9) {
      Alert.alert('Error', 'Unesite ispravan broj telefona');
      return;
    }

    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        phone,
        createdAt: new Date().toISOString(),
      });

      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registracija</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ime i prezime"
        value={name}
        onChangeText={setName}
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Broj telefona"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Lozinka"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TextInput
        style={styles.input}
        placeholder="Potvrdi lozinku"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholderTextColor="#666"
      />

      <TouchableOpacity 
        style={styles.button}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Učitavanje...' : 'Registruj se'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>Već imaš račun? Prijavi se</Text>
      </TouchableOpacity>
    </View>
  );
};

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

export default Register;
