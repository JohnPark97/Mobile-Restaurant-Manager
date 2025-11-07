import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const createMenuItem = async (
  restaurantId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
  }
) => {
  const menuItem = await prisma.menuItem.create({
    data: {
      restaurantId,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl,
    },
  });

  return menuItem;
};

export const getMenuItems = async (restaurantId: string, availableOnly: boolean = false) => {
  const where: any = { restaurantId };
  if (availableOnly) {
    where.available = true;
  }

  const menuItems = await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  });

  return menuItems;
};

export const getMenuItem = async (id: string) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      restaurant: true,
    },
  });

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  return menuItem;
};

export const updateMenuItem = async (
  id: string,
  userId: string,
  data: Partial<{
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    available: boolean;
  }>
) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  if (menuItem.restaurant.ownerId !== userId) {
    throw new AppError('You do not have permission to update this menu item', 403);
  }

  const updated = await prisma.menuItem.update({
    where: { id },
    data,
  });

  return updated;
};

export const deleteMenuItem = async (id: string, userId: string) => {
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: { restaurant: true },
  });

  if (!menuItem) {
    throw new AppError('Menu item not found', 404);
  }

  if (menuItem.restaurant.ownerId !== userId) {
    throw new AppError('You do not have permission to delete this menu item', 403);
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  return { success: true };
};

export const getMenuCategories = async (restaurantId: string) => {
  const categories = await prisma.menuItem.findMany({
    where: { restaurantId },
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  });

  return categories.map(c => c.category);
};

