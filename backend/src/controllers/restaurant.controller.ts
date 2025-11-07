import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/errorHandler';
import { updateRestaurantSchema } from '../utils/validation';

const prisma = new PrismaClient();

export const getRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    res.json({ data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const updateRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if restaurant belongs to user
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new AppError('Restaurant not found', 404);
    }

    if (restaurant.ownerId !== userId) {
      throw new AppError('You do not have permission to update this restaurant', 403);
    }

    const validatedData = updateRestaurantSchema.parse(req.body);

    const updated = await prisma.restaurant.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      message: 'Restaurant updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRestaurant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const restaurant = await prisma.restaurant.findFirst({
      where: { ownerId: userId },
    });

    if (!restaurant) {
      throw new AppError('No restaurant found for this owner', 404);
    }

    res.json({ data: restaurant });
  } catch (error) {
    next(error);
  }
};

export const getAllRestaurants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { approved: true },
      select: {
        id: true,
        name: true,
        address: true,
        phone: true,
        createdAt: true,
      },
    });

    res.json({ data: restaurants });
  } catch (error) {
    next(error);
  }
};

