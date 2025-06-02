import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';  // Change to MaterialIcons
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';

const services = [
  { id: '1', name: 'Šišanje', price: '18KM', duration: '30min', icon: '✂️' },
  { id: '2', name: 'Brada', price: '5MK', duration: '20min', icon: '🪒' },
  { id: '3', name: 'Šišanje + Brada', price: '25KM', duration: '45min', icon: '💈' },
  { id: '4', name: 'Dječije šišanje', price: '15KM', duration: '30min', icon: '👶' },
  
];

const barbers = [
  { id: '1', name: 'Himzo', rating: 4.9 },
  { id: '2', name: 'Rile', rating: 1.2 },

];

const Home = ({ navigation }) => {
  const { logout } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const renderServiceItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.serviceItem,
        selectedService?.id === item.id && styles.selectedItem
      ]}
      onPress={() => setSelectedService(item)}
    >
      <Text style={styles.serviceIcon}>{item.icon}</Text>
      <View style={styles.serviceContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <View style={styles.serviceInfoContainer}>
          <Text style={styles.servicePrice}>{item.price}</Text>
          <Text style={styles.serviceDuration}>{item.duration}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderBarberItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.barberItem,
        selectedBarber?.id === item.id && styles.selectedItem
      ]}
      onPress={() => setSelectedBarber(item)}
    >
      <View style={styles.barberImageContainer}>
        <View style={styles.barberImage}>
          <Text style={styles.barberInitials}>
            {item.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
      </View>
      <View style={styles.barberContent}>
        <Text style={styles.barberName}>{item.name}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.barberRating}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>💈</Text>
        <Text style={styles.header}>Classic Cuts</Text>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => setShowProfile(true)}
        >
          <MaterialIcons name="person" size={30} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.welcomeText}>Dobrodošli!</Text>
        <Text style={styles.sectionTitle}>Usluge</Text>
        <FlatList
          data={services}
          renderItem={renderServiceItem}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.servicesList}
        />

        <Text style={styles.sectionTitle}>Frizeri</Text>
        <View style={styles.barbersContainer}>
          {barbers.map(item => (
            <View key={item.id} style={styles.barberWrapper}>
              {renderBarberItem({ item })}
            </View>
          ))}
        </View>
      </ScrollView>

      {selectedService && selectedBarber && (
        <View style={styles.bottomBar}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('Booking', {
              service: selectedService,
              barber: selectedBarber
            })}
          >
            <Text style={styles.bookButtonText}>Rezerviši termin</Text>
            <Text style={styles.bookingDetails}>
              {selectedService.name} • {selectedService.price}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <Profile 
        visible={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  logo: {
    fontSize: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  profileButton: {
    padding: 8,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginVertical: 15,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    width: 200,
    borderWidth: 1,
    borderColor: '#333',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  serviceInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  servicePrice: {
    color: '#fff',
    fontWeight: 'bold',
  },
  serviceDuration: {
    color: '#fff',
  },
  barberItem: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barberImageContainer: {
    marginRight: 15,
  },
  barberImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barberName: {
    marginLeft: 5,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberRating: {
    color: '#D4AF37',
    fontSize: 16,
  },
  barbersContainer: {
    paddingHorizontal: 5,
  },
  barberWrapper: {
    marginBottom: 15,
  },
  barberImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  barberImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  barberContent: {
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  selectedItem: {
    backgroundColor: '#2A2A2A', // Keep original background
    borderColor: '#D4AF37',    // Change only border color
    borderWidth: 2,           // Make border slightly thicker
  },
  bottomBar: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  bookButton: {
    backgroundColor: '#D4AF37',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bookingDetails: {
    color: '#1A1A1A',
    marginTop: 5,
    fontSize: 14,
  },
});

export default Home;
