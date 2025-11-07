import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Customer routes
router.post('/', authenticate, authorize(UserRole.CUSTOMER), orderController.createOrder);
router.get('/my-orders', authenticate, authorize(UserRole.CUSTOMER), orderController.getMyOrders);
router.get('/:id', authenticate, orderController.getOrder);

// Owner routes
router.get('/restaurant/:restaurantId', authenticate, authorize(UserRole.OWNER), orderController.getRestaurantOrders);
router.patch('/:id/status', authenticate, authorize(UserRole.OWNER), orderController.updateOrderStatus);
router.get('/restaurant/:restaurantId/queue', authenticate, orderController.getRestaurantQueue);

export default router;

