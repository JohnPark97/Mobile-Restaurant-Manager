import { Response, NextFunction } from 'express';
import { OrderStatus, OrderType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import * as orderService from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema } from '../utils/validation';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user!.id;
    const validatedData = createOrderSchema.parse(req.body);

    // Convert pickupTime string to Date if present
    const orderData = {
      ...validatedData,
      pickupTime: validatedData.pickupTime ? new Date(validatedData.pickupTime) : undefined,
    };

    const order = await orderService.createOrder(customerId, orderData);

    res.status(201).json({
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const order = await orderService.getOrder(id, userId);

    res.json({ data: order });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const ownerId = req.user!.id;

    const filters: any = {};

    if (req.query.status) {
      filters.status = req.query.status as OrderStatus;
    }

    if (req.query.type) {
      filters.type = req.query.type as OrderType;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    const orders = await orderService.getRestaurantOrders(restaurantId, ownerId, filters);

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user!.id;
    const orders = await orderService.getCustomerOrders(customerId);

    res.json({ data: orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const ownerId = req.user!.id;

    const validatedData = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateOrderStatus(id, ownerId, validatedData.status);

    res.json({
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const getRestaurantQueue = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { restaurantId } = req.params;
    const queue = await orderService.getRestaurantQueue(restaurantId);

    res.json({ data: queue });
  } catch (error) {
    next(error);
  }
};

