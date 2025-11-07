import { z } from 'zod';

// Authentication schemas
export const registerOwnerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  restaurantName: z.string().min(1, 'Restaurant name is required'),
  restaurantAddress: z.string().min(1, 'Restaurant address is required'),
  restaurantPhone: z.string().min(1, 'Restaurant phone is required'),
  taxNumber: z.string().optional(),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const registerCustomerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const verifyCodeSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits'),
});

// Menu schemas
export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  category: z.string().min(1, 'Category is required'),
  imageUrl: z.string().url().optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// Order schemas
export const createOrderSchema = z.object({
  restaurantId: z.string().uuid(),
  type: z.enum(['TABLE', 'ONLINE']),
  tableNumber: z.string().optional(),
  pickupTime: z.string().datetime().optional(),
  items: z.array(z.object({
    menuItemId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })).min(1, 'At least one item is required'),
  tip: z.number().nonnegative().optional(),
}).refine(data => {
  if (data.type === 'TABLE' && !data.tableNumber) {
    return false;
  }
  if (data.type === 'ONLINE' && !data.pickupTime) {
    return false;
  }
  return true;
}, {
  message: 'Table number required for table orders, pickup time required for online orders',
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
});

// Restaurant schemas
export const updateRestaurantSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  taxNumber: z.string().optional(),
});

