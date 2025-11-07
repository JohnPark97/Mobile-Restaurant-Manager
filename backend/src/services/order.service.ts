import { PrismaClient, OrderType, OrderStatus, PaymentMethod } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';
import { calculateTaxes, generateReceiptNumber, getFiscalYear } from '../utils/tax';
import { emitOrderUpdate, emitRestaurantNotification, emitQueueUpdate } from './socket.service';

const prisma = new PrismaClient();

export const createOrder = async (
  customerId: string,
  data: {
    restaurantId: string;
    type: OrderType;
    tableNumber?: string;
    pickupTime?: Date;
    items: { menuItemId: string; quantity: number }[];
    tip?: number;
  }
) => {
  // Validate menu items and calculate subtotal
  let subtotal = 0;
  const orderItems: Array<{ menuItemId: string; quantity: number; unitPrice: number; subtotal: number }> = [];

  for (const item of data.items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
    });

    if (!menuItem) {
      throw new AppError(`Menu item ${item.menuItemId} not found`, 404);
    }

    if (!menuItem.available) {
      throw new AppError(`Menu item ${menuItem.name} is not available`, 400);
    }

    if (menuItem.restaurantId !== data.restaurantId) {
      throw new AppError(`Menu item ${menuItem.name} does not belong to this restaurant`, 400);
    }

    const itemSubtotal = parseFloat(menuItem.price.toString()) * item.quantity;
    subtotal += itemSubtotal;

    orderItems.push({
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: parseFloat(menuItem.price.toString()),
      subtotal: itemSubtotal,
    });
  }

  // Calculate taxes
  const tip = data.tip || 0;
  const taxes = calculateTaxes(subtotal, tip);

  // Create order with items
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        restaurantId: data.restaurantId,
        customerId,
        type: data.type,
        status: OrderStatus.PENDING,
        tableNumber: data.tableNumber,
        pickupTime: data.pickupTime,
        subtotal: taxes.subtotal,
        gst: taxes.gst,
        pst: taxes.pst,
        tip,
        total: taxes.total,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        customer: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Add to queue for online orders
    if (data.type === OrderType.ONLINE) {
      const queueCount = await tx.orderQueue.count({
        where: { restaurantId: data.restaurantId },
      });

      const estimatedReadyTime = data.pickupTime || new Date(Date.now() + 30 * 60 * 1000); // 30 min default

      await tx.orderQueue.create({
        data: {
          restaurantId: data.restaurantId,
          orderId: newOrder.id,
          queuePosition: queueCount + 1,
          estimatedReadyTime,
        },
      });
    }

    return newOrder;
  });

  // Emit real-time notifications
  emitRestaurantNotification(data.restaurantId, {
    type: 'new_order',
    order,
  });

  if (data.type === OrderType.ONLINE) {
    emitQueueUpdate(data.restaurantId, {
      type: 'queue_updated',
    });
  }

  return order;
};

export const getOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      customer: {
        select: {
          id: true,
          email: true,
          phone: true,
        },
      },
      restaurant: true,
      queueEntry: true,
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Verify user has access to this order
  if (order.customerId !== userId && order.restaurant.ownerId !== userId) {
    throw new AppError('You do not have permission to view this order', 403);
  }

  return order;
};

export const getRestaurantOrders = async (
  restaurantId: string,
  ownerId: string,
  filters?: {
    status?: OrderStatus;
    type?: OrderType;
    startDate?: Date;
    endDate?: Date;
  }
) => {
  // Verify restaurant belongs to owner
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  });

  if (!restaurant || restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to view orders for this restaurant', 403);
  }

  const where: any = { restaurantId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.type) {
    where.type = filters.type;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      customer: {
        select: {
          id: true,
          email: true,
          phone: true,
        },
      },
      queueEntry: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const getCustomerOrders = async (customerId: string) => {
  const orders = await prisma.order.findMany({
    where: { customerId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      restaurant: {
        select: {
          id: true,
          name: true,
          address: true,
          phone: true,
        },
      },
      queueEntry: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
};

export const updateOrderStatus = async (
  orderId: string,
  ownerId: string,
  status: OrderStatus
) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { restaurant: true },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.restaurant.ownerId !== ownerId) {
    throw new AppError('You do not have permission to update this order', 403);
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { status },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
      customer: true,
      queueEntry: true,
    },
  });

  // Create transaction when order is completed
  if (status === OrderStatus.COMPLETED && !order.transaction) {
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        restaurantId: order.restaurantId,
        paymentMethod: PaymentMethod.CASH, // Default, will be updated when payment integration added
        amount: parseFloat(order.total.toString()),
        gstAmount: parseFloat(order.gst.toString()),
        pstAmount: parseFloat(order.pst.toString()),
        tipAmount: parseFloat(order.tip.toString()),
        transactionDate: new Date(),
        fiscalYear: getFiscalYear(),
        receiptNumber: generateReceiptNumber(order.restaurantId),
      },
    });
  }

  // Remove from queue if completed or cancelled
  if (status === OrderStatus.COMPLETED || status === OrderStatus.CANCELLED) {
    const queueEntry = await prisma.orderQueue.findUnique({
      where: { orderId },
    });

    if (queueEntry) {
      await prisma.orderQueue.delete({
        where: { orderId },
      });

      // Update queue positions
      await prisma.orderQueue.updateMany({
        where: {
          restaurantId: order.restaurantId,
          queuePosition: { gt: queueEntry.queuePosition },
        },
        data: {
          queuePosition: { decrement: 1 },
        },
      });

      emitQueueUpdate(order.restaurantId, {
        type: 'queue_updated',
      });
    }
  }

  // Emit order update to customer
  emitOrderUpdate(orderId, {
    orderId,
    status,
    queueEntry: updated.queueEntry,
  });

  return updated;
};

export const getRestaurantQueue = async (restaurantId: string) => {
  const queue = await prisma.orderQueue.findMany({
    where: { restaurantId },
    include: {
      order: {
        include: {
          items: {
            include: {
              menuItem: true,
            },
          },
          customer: {
            select: {
              id: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { queuePosition: 'asc' },
  });

  return queue;
};

