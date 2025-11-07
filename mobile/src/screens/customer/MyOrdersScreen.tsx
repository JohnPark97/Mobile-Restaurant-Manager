import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';

export default function MyOrdersScreen({ navigation }: any) {
  const { data, isLoading } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await api.get('/orders/my-orders');
      return response.data.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#3b82f6';
      case 'PREPARING': return '#8b5cf6';
      case 'READY': return '#10b981';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderTracking', { orderId: item.id })}
          >
            <View style={styles.orderHeader}>
              <Text style={styles.restaurantName}>{item.restaurant.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.orderType}>{item.type} Order</Text>
            {item.tableNumber && <Text style={styles.orderInfo}>Table: {item.tableNumber}</Text>}
            {item.queueEntry && (
              <Text style={styles.orderInfo}>Queue Position: {item.queueEntry.queuePosition}</Text>
            )}
            
            <View style={styles.itemsPreview}>
              {item.items.slice(0, 2).map((orderItem: any) => (
                <Text key={orderItem.id} style={styles.itemText}>
                  {orderItem.quantity}x {orderItem.menuItem.name}
                </Text>
              ))}
              {item.items.length > 2 && (
                <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
              )}
            </View>

            <Text style={styles.orderPrice}>${parseFloat(item.total).toFixed(2)}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No orders yet</Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Browse', { screen: 'RestaurantList' })}
            >
              <Text style={styles.browseButtonText}>Browse Restaurants</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
  orderCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  orderType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemsPreview: {
    marginTop: 8,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  moreItems: {
    fontSize: 12,
    color: '#0ea5e9',
    marginTop: 4,
  },
  orderPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
    marginTop: 8,
  },
  orderDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
  browseButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

