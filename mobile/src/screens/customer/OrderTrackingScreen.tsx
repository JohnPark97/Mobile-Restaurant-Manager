import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../../config/api';

export default function OrderTrackingScreen({ route }: any) {
  const { orderId } = route.params;

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data.data;
    },
    refetchInterval: 5000, // Poll every 5 seconds
  });

  useEffect(() => {
    // Connect to Socket.IO for real-time updates
    const socket = io(API_BASE_URL.replace('/api', ''));

    socket.on('connect', () => {
      socket.emit('join-order', orderId);
    });

    socket.on('order-update', (data) => {
      if (data.orderId === orderId) {
        refetch();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, refetch]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  const statusSteps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' },
    { key: 'COMPLETED', label: 'Completed' },
  ];

  const currentStepIndex = statusSteps.findIndex(step => step.key === order?.status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Status</Text>
        <Text style={styles.restaurantName}>{order?.restaurant.name}</Text>
      </View>

      {order?.status !== 'CANCELLED' ? (
        <View style={styles.statusContainer}>
          {statusSteps.map((step, index) => (
            <View key={step.key} style={styles.statusStep}>
              <View
                style={[
                  styles.statusDot,
                  index <= currentStepIndex && styles.statusDotActive,
                ]}
              />
              <View style={styles.statusInfo}>
                <Text
                  style={[
                    styles.statusLabel,
                    index <= currentStepIndex && styles.statusLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
              {index < statusSteps.length - 1 && (
                <View
                  style={[
                    styles.statusLine,
                    index < currentStepIndex && styles.statusLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.cancelledBanner}>
          <Text style={styles.cancelledText}>Order Cancelled</Text>
        </View>
      )}

      {order?.queueEntry && order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
        <View style={styles.queueInfo}>
          <Text style={styles.queueTitle}>Queue Information</Text>
          <Text style={styles.queueText}>
            Position: {order.queueEntry.queuePosition}
          </Text>
          <Text style={styles.queueText}>
            Estimated Ready: {new Date(order.queueEntry.estimatedReadyTime).toLocaleTimeString()}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Restaurant Info</Text>
        <Text style={styles.infoText}>{order?.restaurant.address}</Text>
        <Text style={styles.infoText}>{order?.restaurant.phone}</Text>
      </View>
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
  header: {
    padding: 20,
    backgroundColor: '#0ea5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  restaurantName: {
    fontSize: 16,
    color: 'white',
    marginTop: 4,
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  statusStep: {
    position: 'relative',
    paddingLeft: 40,
    marginBottom: 24,
  },
  statusDot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    borderWidth: 4,
    borderColor: '#e5e7eb',
  },
  statusDotActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  statusLine: {
    position: 'absolute',
    left: 11,
    top: 24,
    width: 2,
    height: 40,
    backgroundColor: '#e5e7eb',
  },
  statusLineActive: {
    backgroundColor: '#0ea5e9',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    color: '#9ca3af',
    fontWeight: '500',
  },
  statusLabelActive: {
    color: '#333',
    fontWeight: '600',
  },
  cancelledBanner: {
    backgroundColor: '#ef4444',
    padding: 20,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelledText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  queueInfo: {
    backgroundColor: '#fef3c7',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  queueText: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
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
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
});

