import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../config/api';
import { useCartStore } from '../../store/useCartStore';

export default function CheckoutScreen({ navigation }: any) {
  const { items, getTotalPrice, restaurantId, restaurantName, clearCart } = useCartStore();
  const queryClient = useQueryClient();

  const [orderType, setOrderType] = useState<'TABLE' | 'ONLINE'>('ONLINE');
  const [tableNumber, setTableNumber] = useState('');
  const [pickupTime, setPickupTime] = useState(new Date(Date.now() + 30 * 60 * 1000).toISOString());
  const [tip, setTip] = useState('');

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await api.post('/orders', orderData);
    },
    onSuccess: (response) => {
      const orderId = response.data.data.id;
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      clearCart();
      Alert.alert('Success', 'Order placed successfully!', [
        {
          text: 'Track Order',
          onPress: () => navigation.navigate('MyOrders', {
            screen: 'OrderTracking',
            params: { orderId },
          }),
        },
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.error || 'Failed to place order');
    },
  });

  const handlePlaceOrder = () => {
    if (orderType === 'TABLE' && !tableNumber) {
      Alert.alert('Error', 'Please enter a table number');
      return;
    }

    if (orderType === 'ONLINE' && !pickupTime) {
      Alert.alert('Error', 'Please select a pickup time');
      return;
    }

    const orderData: any = {
      restaurantId,
      type: orderType,
      items: items.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
      })),
    };

    if (orderType === 'TABLE') {
      orderData.tableNumber = tableNumber;
    } else {
      orderData.pickupTime = pickupTime;
    }

    if (tip) {
      const tipAmount = parseFloat(tip);
      if (!isNaN(tipAmount) && tipAmount > 0) {
        orderData.tip = tipAmount;
      }
    }

    createOrderMutation.mutate(orderData);
  };

  const subtotal = getTotalPrice();
  const gst = subtotal * 0.05;
  const pst = subtotal * 0.07;
  const tipAmount = parseFloat(tip) || 0;
  const total = subtotal + gst + pst + tipAmount;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      <Text style={styles.restaurantName}>{restaurantName}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Type</Text>
        <View style={styles.typeButtons}>
          <TouchableOpacity
            style={[styles.typeButton, orderType === 'TABLE' && styles.typeButtonActive]}
            onPress={() => setOrderType('TABLE')}
          >
            <Text style={[styles.typeButtonText, orderType === 'TABLE' && styles.typeButtonTextActive]}>
              Table Order
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, orderType === 'ONLINE' && styles.typeButtonActive]}
            onPress={() => setOrderType('ONLINE')}
          >
            <Text style={[styles.typeButtonText, orderType === 'ONLINE' && styles.typeButtonTextActive]}>
              Online Pickup
            </Text>
          </TouchableOpacity>
        </View>

        {orderType === 'TABLE' ? (
          <>
            <Text style={styles.label}>Table Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter table number"
              value={tableNumber}
              onChangeText={setTableNumber}
              keyboardType="number-pad"
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Pickup Time</Text>
            <Text style={styles.info}>Estimated ready in 30 minutes</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Add Tip (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          value={tip}
          onChangeText={setTip}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text>Subtotal:</Text>
          <Text>${subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>GST (5%):</Text>
          <Text>${gst.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text>PST (7%):</Text>
          <Text>${pst.toFixed(2)}</Text>
        </View>
        {tipAmount > 0 && (
          <View style={styles.summaryRow}>
            <Text>Tip:</Text>
            <Text>${tipAmount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalText}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeOrderButton, createOrderMutation.isPending && styles.buttonDisabled]}
        onPress={handlePlaceOrder}
        disabled={createOrderMutation.isPending}
      >
        <Text style={styles.placeOrderButtonText}>
          {createOrderMutation.isPending ? 'Placing Order...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#0ea5e9',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#0ea5e9',
  },
  typeButtonText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeOrderButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

