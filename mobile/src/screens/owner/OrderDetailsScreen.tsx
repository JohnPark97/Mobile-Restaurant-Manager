import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';

export default function OrderDetailsScreen({ route }: any) {
  const { orderId } = route.params;
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      return await api.patch(`/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['restaurantOrders'] });
      Alert.alert('Success', 'Order status updated');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const statusFlow = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
  const currentIndex = statusFlow.indexOf(order?.status);
  const nextStatus = currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <Text style={styles.infoText}>Order ID: {order?.id.slice(0, 8)}</Text>
        <Text style={styles.infoText}>Type: {order?.type}</Text>
        {order?.tableNumber && <Text style={styles.infoText}>Table: {order?.tableNumber}</Text>}
        <Text style={styles.infoText}>Status: {order?.status}</Text>
        <Text style={styles.infoText}>
          Created: {new Date(order?.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Items</Text>
        {order?.items.map((item: any) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.quantity}x {item.menuItem.name}</Text>
            <Text style={styles.itemPrice}>${parseFloat(item.subtotal).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>${parseFloat(order?.subtotal).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>GST (5%):</Text>
          <Text>${parseFloat(order?.gst).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>PST (7%):</Text>
          <Text>${parseFloat(order?.pst).toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>Tip:</Text>
          <Text>${parseFloat(order?.tip).toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>${parseFloat(order?.total).toFixed(2)}</Text>
        </View>
      </View>

      {nextStatus && (
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => updateStatusMutation.mutate(nextStatus)}
          disabled={updateStatusMutation.isPending}
        >
          <Text style={styles.updateButtonText}>
            {updateStatusMutation.isPending ? 'Updating...' : `Mark as ${nextStatus}`}
          </Text>
        </TouchableOpacity>
      )}

      {order?.status !== 'CANCELLED' && order?.status !== 'COMPLETED' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => updateStatusMutation.mutate('CANCELLED')}
          disabled={updateStatusMutation.isPending}
        >
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
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
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

