import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../store/AuthContext';

export default function MenuManagementScreen({ navigation }: any) {
  const { restaurant } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['menu', restaurant?.id],
    queryFn: async () => {
      const response = await api.get(`/menu/restaurant/${restaurant?.id}`);
      return response.data.data;
    },
    enabled: !!restaurant?.id,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('EditMenuItem', { menuItem: item })}
          >
            <View style={styles.menuItemInfo}>
              <Text style={styles.menuItemName}>{item.name}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
              <Text style={styles.menuItemCategory}>{item.category}</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemPrice}>${parseFloat(item.price).toFixed(2)}</Text>
              <View style={[styles.badge, item.available ? styles.badgeAvailable : styles.badgeUnavailable]}>
                <Text style={styles.badgeText}>{item.available ? 'Available' : 'Unavailable'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No menu items yet</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddMenuItem')}
            >
              <Text style={styles.addButtonText}>Add First Item</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {data && data.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddMenuItem')}
        >
          <Text style={styles.fabText}>+</Text>
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
  menuItem: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  menuItemRight: {
    alignItems: 'flex-end',
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
  },
  badgeAvailable: {
    backgroundColor: '#10b981',
  },
  badgeUnavailable: {
    backgroundColor: '#ef4444',
  },
  badgeText: {
    fontSize: 12,
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
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '300',
  },
});

