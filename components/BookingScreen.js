import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

const BookingScreen = ({ route, navigation }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const { service, barber } = route.params;
  const [blockedSlots, setBlockedSlots] = useState({});
  const [reservedSlots, setReservedSlots] = useState({});
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Create a marked dates object for the calendar
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: '#D4AF37',
      selectedTextColor: '#1A1A1A'
    }
  };

  const generateTimeSlots = () => {
    const morning = [];
    const afternoon = [];
    const evening = [];

    // Morning: 9:00 - 11:30
    for (let hour = 9; hour < 12; hour++) {
      morning.push(`${hour}:00`);
      morning.push(`${hour}:30`);
    }

    // Afternoon: 12:00 - 16:30
    for (let hour = 12; hour < 17; hour++) {
      afternoon.push(`${hour}:00`);
      afternoon.push(`${hour}:30`);
    }

    // Evening: 17:00 - 19:30
    for (let hour = 17; hour < 20; hour++) {
      evening.push(`${hour}:00`);
      evening.push(`${hour}:30`);
    }

    return { morning, afternoon, evening };
  };

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    const fetchBlockedSlots = async () => {
      if (!selectedDate) return;

      const q = query(
        collection(db, 'bookings'),
        where('date', '==', selectedDate)
      );

      const querySnapshot = await getDocs(q);
      const blocked = {};
      
      querySnapshot.forEach((doc) => {
        const booking = doc.data();
        if (booking.status === 'blocked' || booking.status === 'approved') {
          blocked[booking.time] = booking.status;
        }
      });

      setBlockedSlots(blocked);
    };

    fetchBlockedSlots();
  }, [selectedDate]);

  useEffect(() => {
    const fetchUnavailableSlots = async () => {
      if (!selectedDate) return;

      const q = query(
        collection(db, 'bookings'),
        where('date', '==', selectedDate),
        where('barberId', '==', barber.id)
      );

      try {
        const querySnapshot = await getDocs(q);
        const unavailable = {};
        
        querySnapshot.forEach((doc) => {
          const booking = doc.data();
          if (booking.status === 'blocked' || 
              booking.status === 'approved' || 
              booking.status === 'pending') {
            unavailable[booking.time] = booking.status;
          }
        });

        setReservedSlots(unavailable);
      } catch (error) {
        console.error("Error fetching slots:", error);
      }
    };

    fetchUnavailableSlots();
  }, [selectedDate, barber.id]);

  const renderTimeSlotSection = (title, slots) => (
    <View style={styles.timeSlotSection}>
      <Text style={styles.timeSlotSectionTitle}>{title}</Text>
      <View style={styles.timeSlotsContainer}>
        {slots.map((time) => {
          const slotStatus = reservedSlots[time];
          const isUnavailable = !!slotStatus;
          
          return (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeSlot,
                selectedTime === time && styles.selectedTimeSlot,
                isUnavailable && getSlotStyle(slotStatus)
              ]}
              onPress={() => {
                if (!isUnavailable) {
                  setSelectedTime(time);
                } else {
                  Alert.alert('Termin nije dostupan', 
                    getSlotMessage(slotStatus));
                }
              }}
              disabled={isUnavailable}
            >
              <Text style={[
                styles.timeText,
                selectedTime === time && styles.selectedTimeText,
                isUnavailable && styles.unavailableTimeText
              ]}>
                {time}
                {isUnavailable && `\n(${getSlotLabel(slotStatus)})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const getSlotStyle = (status) => {
    switch(status) {
      case 'blocked':
        return styles.blockedTimeSlot;
      case 'approved':
      case 'pending':
        return styles.reservedTimeSlot;
      default:
        return {};
    }
  };

  const getSlotLabel = (status) => {
    switch(status) {
      case 'blocked':
        return 'Blokirano';
      case 'approved':
        return 'Rezervisano';
      case 'pending':
        return 'Na čekanju';
      default:
        return '';
    }
  };

  const getSlotMessage = (status) => {
    switch(status) {
      case 'blocked':
        return 'Ovaj termin je blokiran od strane frizera.';
      case 'approved':
        return 'Ovaj termin je već rezervisan.';
      case 'pending':
        return 'Ovaj termin čeka na potvrdu.';
      default:
        return 'Termin nije dostupan.';
    }
  };

  const saveBooking = async () => {
    try {
      const bookingData = {
        serviceId: service.id,
        serviceName: service.name,
        servicePrice: service.price,
        barberId: barber.id,
        barberName: barber.name,
        date: selectedDate,
        time: selectedTime,
        createdAt: new Date().toISOString(),
        status: 'pending',
        // Add user information
        userId: user.uid,
        userName: userData?.name || '',
        userPhone: userData?.phone || '',
        userEmail: userData?.email || ''
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      Alert.alert(
        "Rezervacija poslana",
        "Vaša rezervacija je na čekanju. Bićete obaviješteni kada frizer potvrdi termin.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate('Home')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Došlo je do greške prilikom rezervacije.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Odaberi termin</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.bookingDetails}>
          <Text style={styles.detailText}>Usluga: {service?.name}</Text>
          <Text style={styles.detailText}>Frizer: {barber?.name}</Text>
          {selectedDate && (
            <Text style={styles.detailText}>Datum: {formatDate(selectedDate)}</Text>
          )}
        </View>

        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: '#2A2A2A',
            calendarBackground: '#2A2A2A',
            textSectionTitleColor: '#D4AF37',
            selectedDayBackgroundColor: '#D4AF37',
            selectedDayTextColor: '#1A1A1A',
            todayTextColor: '#D4AF37',
            dayTextColor: '#fff',
            textDisabledColor: '#444',
            monthTextColor: '#D4AF37',
            arrowColor: '#D4AF37',
          }}
          minDate={new Date().toISOString().split('T')[0]}
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={markedDates}
        />

        {selectedDate && (
          <View style={styles.timeSection}>
            <Text style={styles.timeSectionTitle}>Dostupni termini:</Text>
            {renderTimeSlotSection('Jutro', timeSlots.morning)}
            {renderTimeSlotSection('Poslijepodne', timeSlots.afternoon)}
            {renderTimeSlotSection('Veče', timeSlots.evening)}
          </View>
        )}
      </ScrollView>

      {selectedDate && selectedTime && (
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={saveBooking}
        >
          <Text style={styles.confirmButtonText}>
            Potvrdi rezervaciju
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  bookingDetails: {
    padding: 20,
    backgroundColor: '#2A2A2A',
    marginVertical: 10,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  calendar: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 10,
  },
  timeSection: {
    padding: 20,
  },
  timeSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  timeSlotSection: {
    marginBottom: 20,
  },
  timeSlotSectionTitle: {
    fontSize: 16,
    color: '#D4AF37',
    marginBottom: 10,
    paddingLeft: 5,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 10,
  },
  timeSlot: {
    width: '31%',
    padding: 12,
    margin: '1%',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  selectedTimeSlot: {
    borderColor: '#D4AF37',
    borderWidth: 2,
  },
  timeText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
  },
  selectedTimeText: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#D4AF37',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: 'bold',
  },
  blockedTimeSlot: {
    backgroundColor: '#FF404040',
    borderColor: '#FF4040',
    opacity: 0.7,
  },
  bookedTimeSlot: {
    backgroundColor: '#40404040',
    borderColor: '#404040',
    opacity: 0.7,
  },
  blockedTimeText: {
    color: '#FF4040',
    fontSize: 12,
    textAlign: 'center',
  },
  bookedTimeText: {
    color: '#808080',
    fontSize: 12,
    textAlign: 'center',
  },
  reservedTimeSlot: {
    backgroundColor: '#40404040',
    borderColor: '#FFA500',
    opacity: 0.7,
  },
  unavailableTimeText: {
    color: '#808080',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default BookingScreen;
