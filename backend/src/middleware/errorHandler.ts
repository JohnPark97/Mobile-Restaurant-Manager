import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, { statusCode: err.statusCode, stack: err.stack });
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    logger.error(`Prisma Error: ${err.message}`, { stack: err.stack });
    return res.status(400).json({
      error: 'Database operation failed',
      statusCode: 400,
    });
  }

  // Validation errors (Zod)
  if (err.name === 'ZodError') {
    logger.error(`Validation Error: ${err.message}`, { stack: err.stack });
    return res.status(400).json({
      error: 'Validation failed',
      details: err,
      statusCode: 400,
    });
  }

  // Generic errors
  logger.error(`Unexpected Error: ${err.message}`, { stack: err.stack });
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    statusCode: 500,
  });
};

