import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../store/AuthContext';

export default function AddMenuItemScreen({ navigation }: any) {
  const { restaurant } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post(`/menu/restaurant/${restaurant?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurant?.id] });
      Alert.alert('Success', 'Menu item added successfully');
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add menu item');
    },
  });

  const handleSubmit = () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    mutation.mutate({
      name,
      description: description || undefined,
      price: priceNum,
      category,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g., Margherita Pizza"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your dish..."
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Price * ($)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Category *</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Pizza, Salad, Drinks"
      />

      <TouchableOpacity
        style={[styles.button, mutation.isPending && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={mutation.isPending}
      >
        <Text style={styles.buttonText}>{mutation.isPending ? 'Adding...' : 'Add Menu Item'}</Text>
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

