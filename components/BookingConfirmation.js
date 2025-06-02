import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { formatDate } from '../utils/dateFormatter';

const BookingConfirmation = ({ route, navigation }) => {
  const booking = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rezervacija potvrđena!</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>Usluga: {booking.serviceName}</Text>
        <Text style={styles.detailText}>Cijena: {booking.servicePrice}</Text>
        <Text style={styles.detailText}>Frizer: {booking.barberName}</Text>
        <Text style={styles.detailText}>Datum: {formatDate(booking.date)}</Text>
        <Text style={styles.detailText}>Vrijeme: {booking.time}</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Povratak na početnu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    marginBottom: 30,
  },
  detailsContainer: {
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#D4AF37',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingConfirmation;
