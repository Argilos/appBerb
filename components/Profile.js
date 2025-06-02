import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';  // Add getDoc import
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

const Profile = ({ visible, onClose }) => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [upcomingExpanded, setUpcomingExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [activeScreen, setActiveScreen] = useState('profile'); // 'profile', 'upcoming', 'history'

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        } else {
          console.log('No user data found');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const bookingsData = [];
        querySnapshot.forEach((doc) => {
          bookingsData.push({ id: doc.id, ...doc.data() });
        });
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    if (visible) {
      fetchUserData();
      fetchBookings();
    }
  }, [visible, user]);

  // Add refresh interval
  useEffect(() => {
    if (visible) {
      const interval = setInterval(() => {
        // Refresh the view to move passed bookings to history
        setBookings([...bookings]);
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [visible, bookings]);

  const renderBooking = (booking) => (
    <View key={booking.id} style={styles.bookingItem}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingDate}>{formatDate(booking.date)}</Text>
        <Text style={[styles.statusBadge, 
          booking.status === 'approved' ? styles.statusApproved :
          booking.status === 'pending' ? styles.statusPending :
          styles.statusCancelled
        ]}>
          {booking.status.toUpperCase()}
        </Text>
      </View>
      <Text style={styles.bookingText}>Vrijeme: {booking.time}</Text>
      <Text style={styles.bookingText}>Usluga: {booking.serviceName}</Text>
      <Text style={styles.bookingText}>Frizer: {booking.barberName}</Text>
      <Text style={styles.bookingText}>Cijena: {booking.servicePrice}</Text>
      {booking.cancellationReason && (
        <Text style={styles.cancellationText}>
          Razlog otkazivanja: {booking.cancellationReason}
        </Text>
      )}
    </View>
  );

  const upcomingBookings = bookings
    .filter(b => {
      const bookingDateTime = new Date(`${b.date}T${b.time}`);
      return bookingDateTime > new Date() && b.status !== 'cancelled';
    })
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

  const pastBookings = bookings
    .filter(b => {
      const bookingDateTime = new Date(`${b.date}T${b.time}`);
      return bookingDateTime <= new Date() || b.status === 'cancelled';
    })
    .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  const renderScreen = () => {
    switch (activeScreen) {
      case 'upcoming':
        return (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setActiveScreen('profile')}>
                <Text style={styles.backButton}>◀ Nazad</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Predstojeće rezervacije</Text>
              <View style={styles.placeholder} />
            </View>
            <ScrollView style={styles.content}>
              {upcomingBookings.length === 0 ? (
                <Text style={styles.emptyText}>Nema predstojećih rezervacija</Text>
              ) : (
                upcomingBookings.map(renderBooking)
              )}
            </ScrollView>
          </>
        );
      case 'history':
        return (
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setActiveScreen('profile')}>
                <Text style={styles.backButton}>◀ Nazad</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Historija rezervacija</Text>
              <View style={styles.placeholder} />
            </View>
            <ScrollView style={styles.content}>
              {pastBookings.length === 0 ? (
                <Text style={styles.emptyText}>Nema prethodnih rezervacija</Text>
              ) : (
                pastBookings.map(renderBooking)
              )}
            </ScrollView>
          </>
        );
      default:
        return (
          <>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Profil</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.content}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Lični podaci</Text>
                <View style={styles.userInfo}>
                  <Text style={styles.userInfoText}>Ime: {userData?.displayName || userData?.name || 'N/A'}</Text>
                  <Text style={styles.userInfoText}>Email: {userData?.email || 'N/A'}</Text>
                  <Text style={styles.userInfoText}>Telefon: {userData?.phone || 'N/A'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setActiveScreen('upcoming')}
              >
                <Text style={styles.menuItemText}>Predstojeće rezervacije</Text>
                <Text style={styles.menuItemCount}>{upcomingBookings.length}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => setActiveScreen('history')}
              >
                <Text style={styles.menuItemText}>Historija rezervacija</Text>
                <Text style={styles.menuItemCount}>{pastBookings.length}</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={logout}
            >
              <Text style={styles.logoutText}>Odjava</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderScreen()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    color: '#D4AF37',
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 0, // Override existing marginBottom
  },
  userInfo: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
  },
  userInfoText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  bookingItem: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingDate: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusApproved: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#FFA500',
    color: '#000',
  },
  statusCancelled: {
    backgroundColor: '#9e9e9e',
    color: '#fff',
  },
  bookingText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  cancellationText: {
    color: '#f44336',
    fontSize: 14,
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: '#D4AF37',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemCount: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    color: '#D4AF37',
    fontSize: 16,
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
});

export default Profile;
