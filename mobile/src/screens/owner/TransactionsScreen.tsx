import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../store/AuthContext';

export default function TransactionsScreen({ navigation }: any) {
  const { restaurant } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', restaurant?.id],
    queryFn: async () => {
      const response = await api.get(`/transactions/restaurant/${restaurant?.id}`);
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
      <TouchableOpacity
        style={styles.taxButton}
        onPress={() => navigation.navigate('TaxDashboard')}
      >
        <Text style={styles.taxButtonText}>View Tax Reports</Text>
      </TouchableOpacity>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
              <Text style={styles.receiptNumber}>Receipt: {item.receiptNumber}</Text>
              <Text style={styles.transactionAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
            </View>
            
            <View style={styles.transactionDetails}>
              <Text style={styles.detailText}>GST: ${parseFloat(item.gstAmount).toFixed(2)}</Text>
              <Text style={styles.detailText}>PST: ${parseFloat(item.pstAmount).toFixed(2)}</Text>
              <Text style={styles.detailText}>Tip: ${parseFloat(item.tipAmount).toFixed(2)}</Text>
            </View>

            <Text style={styles.transactionDate}>
              {new Date(item.transactionDate).toLocaleString()}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
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
  taxButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  taxButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptNumber: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  transactionDetails: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
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
});

