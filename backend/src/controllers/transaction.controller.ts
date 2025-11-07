import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import * as transactionService from '../services/transaction.service';

export const getTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user!.id;

    const filters: any = {};

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.fiscalYear) {
      filters.fiscalYear = parseInt(req.query.fiscalYear as string);
    }

    const transactions = await transactionService.getTransactions(restaurantId, ownerId, filters);

    res.json({ data: transactions });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ownerId = req.user!.id;

    const transaction = await transactionService.getTransaction(id, ownerId);

    res.json({ data: transaction });
  } catch (error) {
    next(error);
  }
};

export const getSalesReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user!.id;

    const period = (req.query.period as 'daily' | 'weekly' | 'monthly' | 'yearly') || 'daily';
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const report = await transactionService.getSalesReport(restaurantId, ownerId, period, startDate, endDate);

    res.json({ data: report });
  } catch (error) {
    next(error);
  }
};

export const getTaxSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user!.id;

    const fiscalYear = req.query.fiscalYear ? parseInt(req.query.fiscalYear as string) : undefined;

    const summary = await transactionService.getTaxSummary(restaurantId, ownerId, fiscalYear);

    res.json({ data: summary });
  } catch (error) {
    next(error);
  }
};

export const exportTransactions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user!.id;

    const format = (req.query.format as 'csv' | 'json') || 'json';
    
    const filters: any = {};
    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }
    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }
    if (req.query.fiscalYear) {
      filters.fiscalYear = parseInt(req.query.fiscalYear as string);
    }

    const result = await transactionService.exportTransactions(restaurantId, ownerId, format, filters);

    if (format === 'csv' && 'csv' in result) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${Date.now()}.csv"`);
      res.send(result.csv);
    } else {
      res.json(result);
    }
  } catch (error) {
    next(error);
  }
};

