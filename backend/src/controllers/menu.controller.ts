import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import * as menuService from '../services/menu.service';
import { createMenuItemSchema, updateMenuItemSchema } from '../utils/validation';

const prisma = new PrismaClient();

export const createMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user!.id;

    // Verify restaurant belongs to user
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to add items to this restaurant' });
    }

    const validatedData = createMenuItemSchema.parse(req.body);
    const menuItem = await menuService.createMenuItem(restaurantId, validatedData);

    res.status(201).json({
      message: 'Menu item created successfully',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

export const getMenuItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const availableOnly = req.query.available === 'true';

    const menuItems = await menuService.getMenuItems(restaurantId, availableOnly);

    res.json({ data: menuItems });
  } catch (error) {
    next(error);
  }
};

export const getMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const menuItem = await menuService.getMenuItem(id);

    res.json({ data: menuItem });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const validatedData = updateMenuItemSchema.parse(req.body);
    const menuItem = await menuService.updateMenuItem(id, userId, validatedData);

    res.json({
      message: 'Menu item updated successfully',
      data: menuItem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await menuService.deleteMenuItem(id, userId);

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getMenuCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const categories = await menuService.getMenuCategories(restaurantId);

    res.json({ data: categories });
  } catch (error) {
    next(error);
  }
};

export const uploadMenuImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      message: 'Image uploaded successfully',
      data: { imageUrl },
    });
  } catch (error) {
    next(error);
  }
};

