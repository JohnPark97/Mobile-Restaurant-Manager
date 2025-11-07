import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useCartStore } from '../../store/useCartStore';

export default function RestaurantMenuScreen({ route, navigation }: any) {
  const { restaurant } = route.params;
  const { addItem, items, getItemCount } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['menu', restaurant.id],
    queryFn: async () => {
      const response = await api.get(`/menu/restaurant/${restaurant.id}?available=true`);
      return response.data.data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{restaurant.name}</Text>
        <Text style={styles.subtitle}>{restaurant.address}</Text>
      </View>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const itemCount = getItemCount(item.id);
          return (
            <View style={styles.menuItem}>
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.menuItemDescription}>{item.description}</Text>
                )}
                <Text style={styles.menuItemCategory}>{item.category}</Text>
                <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
              </View>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addItem({ ...item, restaurantId: restaurant.id, restaurantName: restaurant.name })}
              >
                <Text style={styles.addButtonText}>
                  {itemCount > 0 ? `Add (${itemCount})` : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No menu items available</Text>
          </View>
        }
      />

      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>View Cart ({totalItems})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  menuItemDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  menuItemCategory: {
    fontSize: 12,
    color: '#0ea5e9',
    marginTop: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
  },
  cartButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

