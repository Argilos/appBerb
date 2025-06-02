import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import components with explicit paths
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import BookingScreen from './components/BookingScreen';
import BookingConfirmation from './components/BookingConfirmation';
import AdminPanel from './components/AdminPanel';

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        gestureEnabled: false // Disable swipe back
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Group screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen 
            name="Welcome" 
            component={Welcome}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
        </Stack.Group>
      ) : isAdmin ? (
        // Admin Stack
        <Stack.Group screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen name="AdminPanel" component={AdminPanel} />
        </Stack.Group>
      ) : (
        // App Stack
        <Stack.Group screenOptions={{ gestureEnabled: false }}>
          <Stack.Screen 
            name="Home" 
            component={Home}
            options={{ gestureEnabled: false }}
          />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="BookingConfirmation" component={BookingConfirmation} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}
