import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  SafeAreaView, Alert, Modal, TextInput 
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { collection, query, onSnapshot, doc, updateDoc, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';

const AdminPanel = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'schedule'
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const { logout } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'bookings'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const bookingsData = [];
      const marks = {};

      querySnapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() };
        bookingsData.push(booking);
        
        // Mark dates with appointments
        marks[booking.date] = {
          marked: true,
          dotColor: booking.status === 'blocked' ? '#f44336' :
                   booking.status === 'approved' ? '#4CAF50' : '#FFA500'
        };
      });

      setBookings(bookingsData);
      setMarkedDates(marks);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: newStatus,
        lastUpdated: new Date().toISOString()
      });

      Alert.alert('Success', 'Status uspješno promijenjen');
    } catch (error) {
      Alert.alert('Error', 'Došlo je do greške prilikom ažuriranja');
    }
  };

  const handleTimeSlotAction = async (time, action) => {
    try {
      const slotData = {
        date: selectedDate,
        time: time,
        status: action,
        createdAt: new Date().toISOString(),
        isTimeSlot: true // Flag to identify manually blocked slots
      };

      await addDoc(collection(db, 'bookings'), slotData);
      Alert.alert('Success', `Termin uspješno ${action === 'blocked' ? 'blokiran' : 'otkazan'}`);
    } catch (error) {
      Alert.alert('Error', 'Došlo je do greške');
    }
  };

  const handleCancelReservation = async () => {
    if (!cancellationReason.trim()) {
      Alert.alert('Error', 'Molimo unesite razlog otkazivanja');
      return;
    }

    try {
      await updateDoc(doc(db, 'bookings', selectedBooking.id), {
        status: 'cancelled',
        cancellationReason,
        cancelledAt: new Date().toISOString()
      });

      setShowModal(false);
      setCancellationReason('');
      setSelectedBooking(null);
      Alert.alert('Success', 'Rezervacija uspješno otkazana');
    } catch (error) {
      Alert.alert('Error', 'Došlo je do greške prilikom otkazivanja');
    }
  };

  const getDayAppointments = () => {
    return bookings.filter(booking => booking.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const renderAppointment = (booking) => (
    <View key={booking.id} style={[
      styles.appointmentItem,
      booking.status === 'blocked' && styles.blockedAppointment
    ]}>
      <View style={styles.appointmentHeader}>
        <Text style={styles.timeText}>{booking.time}</Text>
        <Text style={[styles.statusBadge, 
          booking.status === 'approved' ? styles.statusApproved :
          booking.status === 'blocked' ? styles.statusBlocked :
          booking.status === 'cancelled' ? styles.statusCancelled :
          styles.statusPending
        ]}>
          {booking.status.toUpperCase()}
        </Text>
      </View>

      <View style={styles.appointmentDetails}>
        <Text style={styles.detailText}>Datum: {formatDate(booking.date)}</Text>
        <Text style={styles.detailText}>Usluga: {booking.serviceName}</Text>
        <Text style={styles.detailText}>Frizer: {booking.barberName}</Text>
        <Text style={styles.detailText}>Cijena: {booking.servicePrice}</Text>
        {booking.userName && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoTitle}>Informacije o klijentu:</Text>
            <Text style={styles.detailText}>Ime: {booking.userName}</Text>
            <Text style={styles.detailText}>Telefon: {booking.userPhone}</Text>
            <Text style={styles.detailText}>Email: {booking.userEmail}</Text>
          </View>
        )}
      </View>

      <View style={styles.actionButtons}>
        {booking.status === 'pending' && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleStatusUpdate(booking.id, 'approved')}
            >
              <Text style={styles.buttonText}>Odobri</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]}
              onPress={() => handleStatusUpdate(booking.id, 'cancelled')}
            >
              <Text style={styles.buttonText}>Otkaži</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, 
            booking.status === 'blocked' ? styles.unblockButton : styles.blockButton
          ]}
          onPress={() => handleStatusUpdate(booking.id, 
            booking.status === 'blocked' ? 'cancelled' : 'blocked'
          )}
        >
          <Text style={styles.buttonText}>
            {booking.status === 'blocked' ? 'Odblokiraj' : 'Blokiraj'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
        onPress={() => setActiveTab('pending')}
      >
        <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
          Zahtjevi na čekanju
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.tab, activeTab === 'schedule' && styles.activeTab]}
        onPress={() => setActiveTab('schedule')}
      >
        <Text style={[styles.tabText, activeTab === 'schedule' && styles.activeTabText]}>
          Raspored
        </Text>
      </TouchableOpacity>
    </View>
  );

  const PendingRequestsTab = () => {
    const pendingBookings = bookings.filter(booking => booking.status === 'pending')
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Zahtjevi na čekanju</Text>
        {pendingBookings.length === 0 ? (
          <Text style={styles.emptyText}>Nema zahtjeva na čekanju</Text>
        ) : (
          pendingBookings.map(booking => renderAppointment(booking))
        )}
      </ScrollView>
    );
  };

  const ScheduleTab = () => {
    const generateTimeSlots = () => {
      const morning = [];
      const afternoon = [];
      const evening = [];

      // Morning: 9:00 - 11:30
      for (let hour = 9; hour <= 11; hour++) {
        morning.push(`${hour}:00`);
        morning.push(`${hour}:30`);
      }

      // Afternoon: 12:00 - 16:30
      for (let hour = 12; hour <= 16; hour++) {
        afternoon.push(`${hour}:00`);
        afternoon.push(`${hour}:30`);
      }

      // Evening: 17:00 - 19:30
      for (let hour = 17; hour <= 19; hour++) {
        evening.push(`${hour}:00`);
        evening.push(`${hour}:30`);
      }

      return { morning, afternoon, evening };
    };

    const timeSlots = generateTimeSlots();

    const renderTimeSlots = (slots, title) => (
      <View style={styles.timeSlotsSection}>
        <Text style={styles.timeSlotTitle}>{title}</Text>
        <View style={styles.timeSlotsGrid}>
          {slots.map(time => {
            const booking = bookings.find(b => 
              b.date === selectedDate && 
              b.time === time
            );
            const isBlocked = booking?.status === 'blocked';
            const isBooked = booking?.status === 'approved';

            return (
              <View key={time} style={styles.timeSlotContainer}>
                <Text style={styles.timeText}>{time}</Text>
                <View style={styles.timeSlotActions}>
                  {!isBooked && !isBlocked && (
                    <TouchableOpacity
                      style={[styles.timeSlotButton, styles.blockButton]}
                      onPress={() => handleTimeSlotAction(time, 'blocked')}
                    >
                      <Text style={styles.buttonText}>Blokiraj</Text>
                    </TouchableOpacity>
                  )}
                  {isBlocked && (
                    <TouchableOpacity
                      style={[styles.timeSlotButton, styles.unblockButton]}
                      onPress={() => handleTimeSlotAction(time, 'available')}
                    >
                      <Text style={styles.buttonText}>Odblokiraj</Text>
                    </TouchableOpacity>
                  )}
                  {isBooked && (
                    <TouchableOpacity
                      style={styles.viewDetailsButton}
                      onPress={() => {
                        setSelectedBooking(booking);
                        setShowModal(true);
                      }}
                    >
                      <Text style={styles.buttonText}>Detalji</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );

    return (
      <View style={styles.tabContent}>
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
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#D4AF37',
            }
          }}
          onDayPress={day => setSelectedDate(day.dateString)}
        />
        <ScrollView style={styles.timeSlotsList}>
          <Text style={styles.dateTitle}>
            Termini za {selectedDate ? formatDate(selectedDate) : ''}
          </Text>
          {renderTimeSlots(timeSlots.morning, 'Jutro')}
          {renderTimeSlots(timeSlots.afternoon, 'Poslijepodne')}
          {renderTimeSlots(timeSlots.evening, 'Veče')}
        </ScrollView>
      </View>
    );
  };

  const ReservationDetailsModal = () => (
    <Modal
      visible={showModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Detalji Rezervacije</Text>
          
          {selectedBooking && (
            <ScrollView style={styles.modalDetailsScroll}>
              <View style={styles.modalDetails}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Termin</Text>
                  <Text style={styles.modalDetailText}>Datum: {formatDate(selectedBooking.date)}</Text>
                  <Text style={styles.modalDetailText}>Vrijeme: {selectedBooking.time}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Usluga</Text>
                  <Text style={styles.modalDetailText}>Naziv: {selectedBooking.serviceName}</Text>
                  <Text style={styles.modalDetailText}>Cijena: {selectedBooking.servicePrice}</Text>
                  <Text style={styles.modalDetailText}>Frizer: {selectedBooking.barberName}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Informacije o klijentu</Text>
                  <Text style={styles.modalDetailText}>Ime: {selectedBooking.userName || 'Nije dostupno'}</Text>
                  <Text style={styles.modalDetailText}>Telefon: {selectedBooking.userPhone || 'Nije dostupno'}</Text>
                  <Text style={styles.modalDetailText}>Email: {selectedBooking.userEmail || 'Nije dostupno'}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Status i Akcije</Text>
                  <Text style={[
                    styles.modalStatusBadge,
                    selectedBooking.status === 'approved' && styles.statusApproved,
                    selectedBooking.status === 'pending' && styles.statusPending,
                    selectedBooking.status === 'cancelled' && styles.statusCancelled,
                    selectedBooking.status === 'blocked' && styles.statusBlocked,
                  ]}>
                    {selectedBooking.status.toUpperCase()}
                  </Text>
                  
                  {selectedBooking.cancellationReason ? (
                    <View style={styles.cancellationInfo}>
                      <Text style={styles.cancellationLabel}>Razlog otkazivanja:</Text>
                      <Text style={styles.cancellationText}>{selectedBooking.cancellationReason}</Text>
                    </View>
                  ) : selectedBooking.status === 'approved' && (
                    <View style={styles.cancellationForm}>
                      <TextInput
                        style={styles.cancelInput}
                        value={cancellationReason}
                        onChangeText={setCancellationReason}
                        placeholder="Unesite razlog otkazivanja"
                        placeholderTextColor="#666"
                        multiline
                      />
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelReservation}
                      >
                        <Text style={styles.buttonText}>Otkaži Rezervaciju</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              setShowModal(false);
              setCancellationReason('');
              setSelectedBooking(null);
            }}
          >
            <Text style={styles.closeButtonText}>Zatvori</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Odjava</Text>
        </TouchableOpacity>
      </View>

      {renderTabBar()}
      
      {activeTab === 'pending' ? <PendingRequestsTab /> : <ScheduleTab />}
      <ReservationDetailsModal />
    </SafeAreaView>
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
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#D4AF37',
    fontSize: 16,
  },
  calendar: {
    marginBottom: 10,
    borderRadius: 12,
    padding: 10,
  },
  appointmentsList: {
    flex: 1,
    padding: 15,
  },
  dateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15,
  },
  appointmentItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  blockedAppointment: {
    opacity: 0.7,
    borderColor: '#f44336',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusApproved: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  statusBlocked: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  statusCancelled: {
    backgroundColor: '#9e9e9e',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#FFA500',
    color: '#000',
  },
  detailText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#9e9e9e',
  },
  unblockButton: {
    backgroundColor: '#2196F3',
  },
  blockButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#2A2A2A',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#D4AF37',
  },
  tabText: {
    color: '#fff',
    fontSize: 16,
  },
  activeTabText: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    margin: 15,
  },
  timeSlotsSection: {
    marginBottom: 20,
  },
  timeSlotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 10,
  },
  timeSlotsGrid: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 10,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timeSlotActions: {
    flexDirection: 'row',
    gap: 10,
  },
  timeSlotButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookedText: {
    color: '#FFA500',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeSlotsList: {
    flex: 1,
    padding: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 10, // Add horizontal margin
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    maxHeight: '80%', // Limit maximum height
  },
  modalTitle: {
    fontSize: 20, // Reduced from 24
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 15, // Reduced from 20
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 20,
  },
  modalDetailText: {
    color: '#fff',
    fontSize: 14, // Reduced from 16
    marginBottom: 6, // Reduced from 10
  },
  cancelSection: {
    marginTop: 15, // Reduced from 20
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 15, // Reduced from 20
  },
  closeButton: {
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewDetailsButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  userInfoContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  userInfoTitle: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalSection: {
    marginBottom: 12, // Reduced from 20
    padding: 12, // Reduced from 15
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalSectionTitle: {
    color: '#D4AF37',
    fontSize: 16, // Reduced from 18
    fontWeight: 'bold',
    marginBottom: 8, // Reduced from 10
  },
  modalStatusBadge: {
    padding: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancellationContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
  },
  cancellationLabel: {
    color: '#D4AF37',
    fontSize: 14,
    marginBottom: 5,
  },
  cancellationText: {
    color: '#fff',
    fontSize: 14,
  },
  statusApproved: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  statusBlocked: {
    backgroundColor: '#f44336',
    color: '#fff',
  },
  statusCancelled: {
    backgroundColor: '#9e9e9e',
    color: '#fff',
  },
  statusPending: {
    backgroundColor: '#FFA500',
    color: '#000',
  },
  modalDetailsScroll: {
    maxHeight: '80%',
  },
  cancellationInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
  },
  cancellationForm: {
    marginTop: 10,
  },
  cancelInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 10,
    minHeight: 80,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
});


export default AdminPanel;
