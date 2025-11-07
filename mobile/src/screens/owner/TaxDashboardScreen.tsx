import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../config/api';
import { useAuth } from '../../store/AuthContext';

export default function TaxDashboardScreen() {
  const { restaurant } = useAuth();
  const currentYear = new Date().getFullYear();

  const { data: taxSummary, isLoading } = useQuery({
    queryKey: ['taxSummary', restaurant?.id, currentYear],
    queryFn: async () => {
      const response = await api.get(`/transactions/restaurant/${restaurant?.id}/tax-summary`, {
        params: { fiscalYear: currentYear },
      });
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tax Summary {currentYear}</Text>
        <Text style={styles.subtitle}>BC Canada Tax Compliance Report</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Sales</Text>
        <Text style={styles.cardValue}>${taxSummary?.totalSales.toFixed(2) || '0.00'}</Text>
        <Text style={styles.cardSubtext}>{taxSummary?.transactionCount || 0} transactions</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>GST Collected (5%)</Text>
        <Text style={styles.cardValue}>${taxSummary?.totalGst.toFixed(2) || '0.00'}</Text>
        <Text style={styles.cardSubtext}>Federal Tax</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>PST Collected (7%)</Text>
        <Text style={styles.cardValue}>${taxSummary?.totalPst.toFixed(2) || '0.00'}</Text>
        <Text style={styles.cardSubtext}>Provincial Tax (BC)</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tips (Not Taxable)</Text>
        <Text style={styles.cardValue}>${taxSummary?.totalTips.toFixed(2) || '0.00'}</Text>
        <Text style={styles.cardSubtext}>Employee tips</Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>📋 Record Retention Requirements</Text>
        <Text style={styles.noteText}>
          • Keep all transaction records for at least 5 years{'\n'}
          • Required for CRA audits{'\n'}
          • Export reports regularly for backup
        </Text>
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>📊 Tax Filing Reminders</Text>
        <Text style={styles.noteText}>
          • GST/HST: File quarterly or annually{'\n'}
          • PST: File monthly, quarterly, or annually{'\n'}
          • Keep separate records for each tax type
        </Text>
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
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  cardSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  noteCard: {
    backgroundColor: '#fef3c7',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
});

