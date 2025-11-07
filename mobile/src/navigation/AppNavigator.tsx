import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../store/AuthContext';
import { View, ActivityIndicator } from 'react-native';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterOwnerScreen from '../screens/auth/RegisterOwnerScreen';
import RegisterCustomerScreen from '../screens/auth/RegisterCustomerScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';

// Main navigators
import OwnerNavigator from './OwnerNavigator';
import CustomerNavigator from './CustomerNavigator';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="RegisterOwner" component={RegisterOwnerScreen} />
          <Stack.Screen name="RegisterCustomer" component={RegisterCustomerScreen} />
          <Stack.Screen name="Verification" component={VerificationScreen} />
        </Stack.Navigator>
      ) : user?.role === 'OWNER' ? (
        <OwnerNavigator />
      ) : (
        <CustomerNavigator />
      )}
    </NavigationContainer>
  );
}

