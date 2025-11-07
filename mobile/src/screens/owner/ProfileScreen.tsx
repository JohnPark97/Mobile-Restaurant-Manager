import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../store/AuthContext';

export default function ProfileScreen() {
  const { user, restaurant, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Information</Text>
        <Text style={styles.infoText}>Name: {restaurant?.name}</Text>
        <Text style={styles.infoText}>Address: {restaurant?.address}</Text>
        <Text style={styles.infoText}>Phone: {restaurant?.phone}</Text>
        {restaurant?.taxNumber && <Text style={styles.infoText}>Tax Number: {restaurant.taxNumber}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <Text style={styles.infoText}>Email: {user?.email || 'N/A'}</Text>
        <Text style={styles.infoText}>Phone: {user?.phone || 'N/A'}</Text>
        <Text style={styles.infoText}>Role: {user?.role}</Text>
        <Text style={styles.infoText}>
          Verified: {user?.verified ? '✓ Yes' : '✗ No'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    margin: 16,
    marginTop: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

