import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register/owner', authController.registerOwner);
router.post('/register/customer', authController.registerCustomer);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/verify', authenticate, authController.verifyCode);
router.post('/resend-verification', authenticate, authController.resendVerificationCode);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

export default router;

