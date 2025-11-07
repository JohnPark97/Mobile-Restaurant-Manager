import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { getFiscalYear } from '../utils/tax';

const prisma = new PrismaClient();

export const getTransactions = async (
  restaurantId: string,
  ownerId: string,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    fiscalYear?: number;
  }
) => {
  // Verify restaurant belongs to owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to view transactions for this restaurant', 403);
  }

  const where: any = { restaurantId };

  if (filters?.fiscalYear) {
    where.fiscalYear = filters.fiscalYear;
  }

  if (filters?.startDate || filters?.endDate) {
    where.transactionDate = {};
    if (filters.startDate) {
      where.transactionDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.transactionDate.lte = filters.endDate;
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      order: {
        include: {
          customer: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { transactionDate: 'desc' },
  });

  return transactions;
};

export const getTransaction = async (transactionId: string, ownerId: string) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      order: {
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      restaurant: true,
    },
  });

  if (!transaction) {
    throw new AppError('Transaction not found', 404);
  }

  if (transaction.restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to view this transaction', 403);
  }

  return transaction;
};

export const getSalesReport = async (
  restaurantId: string,
  ownerId: string,
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  startDate?: Date,
  endDate?: Date
) => {
  // Verify restaurant belongs to owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to view reports for this restaurant', 403);
  }

  // Set default date range if not provided
  if (!startDate) {
    startDate = new Date();
    switch (period) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
  }

  if (!endDate) {
    endDate = new Date();
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      restaurantId,
      transactionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const summary = transactions.reduce(
    (acc, txn) => {
      acc.totalSales += parseFloat(txn.amount.toString());
      acc.totalGst += parseFloat(txn.gstAmount.toString());
      acc.totalPst += parseFloat(txn.pstAmount.toString());
      acc.totalTips += parseFloat(txn.tipAmount.toString());
      acc.totalOrders += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalGst: 0,
      totalPst: 0,
      totalTips: 0,
      totalOrders: 0,
    }
  );

  return {
    period,
    startDate,
    endDate,
    ...summary,
  };
};

export const getTaxSummary = async (
  restaurantId: string,
  ownerId: string,
  fiscalYear?: number
) => {
  // Verify restaurant belongs to owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to view tax summary for this restaurant', 403);
  }

  if (!fiscalYear) {
    fiscalYear = getFiscalYear();
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      restaurantId,
      fiscalYear,
    },
  });

  const summary = transactions.reduce(
    (acc, txn) => {
      acc.totalSales += parseFloat(txn.amount.toString());
      acc.totalGst += parseFloat(txn.gstAmount.toString());
      acc.totalPst += parseFloat(txn.pstAmount.toString());
      acc.totalTips += parseFloat(txn.tipAmount.toString());
      acc.transactionCount += 1;
      return acc;
    },
    {
      totalSales: 0,
      totalGst: 0,
      totalPst: 0,
      totalTips: 0,
      transactionCount: 0,
    }
  );

  return {
    fiscalYear,
    ...summary,
  };
};

export const exportTransactions = async (
  restaurantId: string,
  ownerId: string,
  format: 'csv' | 'json',
  filters?: {
    startDate?: Date;
    endDate?: Date;
    fiscalYear?: number;
  }
) => {
  const transactions = await getTransactions(restaurantId, ownerId, filters);

  if (format === 'json') {
    return { data: transactions };
  }

  // CSV format
  const headers = [
    'Receipt Number',
    'Transaction Date',
    'Fiscal Year',
    'Payment Method',
    'Subtotal',
    'GST',
    'PST',
    'Tip',
    'Total',
  ];

  const rows = transactions.map(txn => [
    txn.receiptNumber,
    txn.transactionDate.toISOString(),
    txn.fiscalYear,
    txn.paymentMethod,
    (parseFloat(txn.amount.toString()) - parseFloat(txn.gstAmount.toString()) - parseFloat(txn.pstAmount.toString()) - parseFloat(txn.tipAmount.toString())).toFixed(2),
    parseFloat(txn.gstAmount.toString()).toFixed(2),
    parseFloat(txn.pstAmount.toString()).toFixed(2),
    parseFloat(txn.tipAmount.toString()).toFixed(2),
    parseFloat(txn.amount.toString()).toFixed(2),
  ]);

  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

  return { csv };
};

