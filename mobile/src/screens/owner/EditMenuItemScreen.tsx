import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../store/AuthContext';

export default function EditMenuItemScreen({ route, navigation }: any) {
  const { menuItem } = route.params;
  const { restaurant } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(menuItem.name);
  const [description, setDescription] = useState(menuItem.description || '');
  const [price, setPrice] = useState(menuItem.price.toString());
  const [category, setCategory] = useState(menuItem.category);
  const [available, setAvailable] = useState(menuItem.available);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.put(`/menu/${menuItem.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurant?.id] });
      Alert.alert('Success', 'Menu item updated successfully');
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update menu item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await api.delete(`/menu/${menuItem.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu', restaurant?.id] });
      Alert.alert('Success', 'Menu item deleted successfully');
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to delete menu item');
    },
  });

  const handleUpdate = () => {
    if (!name || !price || !category) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    updateMutation.mutate({
      name,
      description: description || undefined,
      price: priceNum,
      category,
      available,
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Menu Item',
      'Are you sure you want to delete this menu item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Price * ($)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Category *</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Available</Text>
        <Switch
          value={available}
          onValueChange={setAvailable}
          trackColor={{ false: '#ccc', true: '#0ea5e9' }}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, updateMutation.isPending && styles.buttonDisabled]}
        onPress={handleUpdate}
        disabled={updateMutation.isPending}
      >
        <Text style={styles.buttonText}>{updateMutation.isPending ? 'Updating...' : 'Update Menu Item'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.deleteButton, deleteMutation.isPending && styles.buttonDisabled]}
        onPress={handleDelete}
        disabled={deleteMutation.isPending}
      >
        <Text style={styles.deleteButtonText}>{deleteMutation.isPending ? 'Deleting...' : 'Delete Menu Item'}</Text>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  button: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
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
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

