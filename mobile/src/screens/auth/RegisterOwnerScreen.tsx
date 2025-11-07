import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../store/AuthContext';

export default function RegisterOwnerScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantAddress, setRestaurantAddress] = useState('');
  const [restaurantPhone, setRestaurantPhone] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(true);

  const { registerOwner } = useAuth();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    if (!restaurantName || !restaurantAddress || !restaurantPhone) {
      Alert.alert('Error', 'Please fill in all restaurant details');
      return;
    }

    if (useEmail && !email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!useEmail && !phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await registerOwner({
        email: useEmail ? email : undefined,
        phone: !useEmail ? phone : undefined,
        password,
        restaurantName,
        restaurantAddress,
        restaurantPhone,
        taxNumber: taxNumber || undefined,
      });

      Alert.alert('Success', 'Registration successful! Please verify your account.', [
        { text: 'OK', onPress: () => navigation.navigate('Verification') },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register as Restaurant Owner</Text>

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={[styles.switchButton, useEmail && styles.switchButtonActive]}
          onPress={() => setUseEmail(true)}
        >
          <Text style={[styles.switchText, useEmail && styles.switchTextActive]}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchButton, !useEmail && styles.switchButtonActive]}
          onPress={() => setUseEmail(false)}
        >
          <Text style={[styles.switchText, !useEmail && styles.switchTextActive]}>Phone</Text>
        </TouchableOpacity>
      </View>

      {useEmail ? (
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="Phone Number (+1234567890)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password (min 8 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Text style={styles.sectionTitle}>Restaurant Details</Text>

      <TextInput
        style={styles.input}
        placeholder="Restaurant Name"
        value={restaurantName}
        onChangeText={setRestaurantName}
      />

      <TextInput
        style={styles.input}
        placeholder="Restaurant Address"
        value={restaurantAddress}
        onChangeText={setRestaurantAddress}
      />

      <TextInput
        style={styles.input}
        placeholder="Restaurant Phone"
        value={restaurantPhone}
        onChangeText={setRestaurantPhone}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Tax Number (Optional)"
        value={taxNumber}
        onChangeText={setTaxNumber}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Registering...' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Back to Welcome</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  switchButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  switchButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  switchText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  switchTextActive: {
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    color: '#0ea5e9',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 16,
  },
});

