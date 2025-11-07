import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import {
  registerOwnerSchema,
  registerCustomerSchema,
  loginSchema,
  verifyCodeSchema,
} from '../utils/validation';
import { AuthRequest } from '../middleware/auth.middleware';

export const registerOwner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerOwnerSchema.parse(req.body);
    const result = await authService.registerOwner(validatedData);

    res.status(201).json({
      message: 'Owner registered successfully. Please verify your account.',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          verified: result.user.verified,
        },
        restaurant: result.restaurant,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const registerCustomer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerCustomerSchema.parse(req.body);
    const result = await authService.registerCustomer(validatedData);

    res.status(201).json({
      message: 'Customer registered successfully. Please verify your account.',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          verified: result.user.verified,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData.emailOrPhone, validatedData.password);

    res.json({
      message: 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          verified: result.user.verified,
        },
        restaurant: result.restaurant,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validatedData = verifyCodeSchema.parse(req.body);
    const userId = req.user!.id;

    await authService.verifyCode(userId, validatedData.code);

    res.json({
      message: 'Account verified successfully',
      data: { verified: true },
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationCode = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await authService.resendVerificationCode(userId);

    res.json({
      message: 'Verification code sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    await authService.logout(userId);

    res.json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedRestaurants: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          verified: user.verified,
        },
        restaurant: user.ownedRestaurants[0] || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

