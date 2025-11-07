import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';

let io: Server;

export const initializeSocketIO = (socketServer: Server) => {
  io = socketServer;

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join restaurant room
    socket.on('join-restaurant', (restaurantId: string) => {
      socket.join(`restaurant-${restaurantId}`);
      logger.info(`Socket ${socket.id} joined restaurant-${restaurantId}`);
    });

    // Join order room (for customers tracking their orders)
    socket.on('join-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
      logger.info(`Socket ${socket.id} joined order-${orderId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

export const emitOrderUpdate = (orderId: string, data: any) => {
  if (io) {
    io.to(`order-${orderId}`).emit('order-update', data);
    logger.debug(`Emitted order update for order ${orderId}`);
  }
};

export const emitRestaurantNotification = (restaurantId: string, data: any) => {
  if (io) {
    io.to(`restaurant-${restaurantId}`).emit('restaurant-notification', data);
    logger.debug(`Emitted notification to restaurant ${restaurantId}`);
  }
};

export const emitQueueUpdate = (restaurantId: string, data: any) => {
  if (io) {
    io.to(`restaurant-${restaurantId}`).emit('queue-update', data);
    logger.debug(`Emitted queue update for restaurant ${restaurantId}`);
  }
};

export { io };

