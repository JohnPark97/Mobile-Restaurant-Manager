import { Router } from 'express';
import * as menuController from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { upload, resizeImage } from '../middleware/upload.middleware';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes (customers can view menu)
router.get('/restaurant/:restaurantId', authenticate, menuController.getMenuItems);
router.get('/restaurant/:restaurantId/categories', authenticate, menuController.getMenuCategories);
router.get('/:id', authenticate, menuController.getMenuItem);

// Owner-only routes
router.post(
  '/restaurant/:restaurantId',
  authenticate,
  authorize(UserRole.OWNER),
  menuController.createMenuItem
);
router.put('/:id', authenticate, authorize(UserRole.OWNER), menuController.updateMenuItem);
router.delete('/:id', authenticate, authorize(UserRole.OWNER), menuController.deleteMenuItem);

// Image upload
router.post(
  '/upload',
  authenticate,
  authorize(UserRole.OWNER),
  upload.single('image'),
  resizeImage,
  menuController.uploadMenuImage
);

export default router;

