import { Router } from 'express';
import * as restaurantController from '../controllers/restaurant.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/', authenticate, restaurantController.getAllRestaurants);
router.get('/:id', authenticate, restaurantController.getRestaurant);

// Owner-only routes
router.get('/my/restaurant', authenticate, authorize(UserRole.OWNER), restaurantController.getMyRestaurant);
router.put('/:id', authenticate, authorize(UserRole.OWNER), restaurantController.updateRestaurant);

export default router;

