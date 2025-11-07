import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// All routes are owner-only
router.use(authenticate, authorize(UserRole.OWNER));

router.get('/restaurant/:restaurantId', transactionController.getTransactions);
router.get('/restaurant/:restaurantId/sales-report', transactionController.getSalesReport);
router.get('/restaurant/:restaurantId/tax-summary', transactionController.getTaxSummary);
router.get('/restaurant/:restaurantId/export', transactionController.exportTransactions);
router.get('/:id', transactionController.getTransaction);

export default router;

