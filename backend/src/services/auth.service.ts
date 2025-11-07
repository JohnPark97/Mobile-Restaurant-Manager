import { PrismaClient, UserRole } from '@prisma/client';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateVerificationCode,
} from '../utils/crypto';
import { AppError } from '../middleware/errorHandler';
import { sendVerificationEmail } from './email.service';
import { sendVerificationSMS } from './sms.service';

const prisma = new PrismaClient();

export const registerOwner = async (data: {
  email?: string;
  phone?: string;
  password: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  taxNumber?: string;
}) => {
  // Check if user already exists
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 400);
  }
  if (data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new AppError('Phone already registered', 400);
  }

  const passwordHash = await hashPassword(data.password);
  const verificationCode = generateVerificationCode();
  const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Create user and restaurant in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        passwordHash,
        role: UserRole.OWNER,
        verified: false,
        verificationCode,
        verificationExpiry,
      },
    });

    const restaurant = await tx.restaurant.create({
      data: {
        ownerId: user.id,
        name: data.restaurantName,
        address: data.restaurantAddress,
        phone: data.restaurantPhone,
        taxNumber: data.taxNumber,
        approved: true, // Auto-approved for now, FUTURE: admin approval
      },
    });

    return { user, restaurant };
  });

  // Send verification code
  if (data.email) {
    await sendVerificationEmail(data.email, verificationCode);
  } else if (data.phone) {
    await sendVerificationSMS(data.phone, verificationCode);
  }

  const accessToken = generateAccessToken(result.user.id, result.user.role);
  const refreshToken = generateRefreshToken(result.user.id, result.user.role);

  // Store refresh token
  await prisma.user.update({
    where: { id: result.user.id },
    data: { refreshToken },
  });

  return {
    user: result.user,
    restaurant: result.restaurant,
    accessToken,
    refreshToken,
  };
};

export const registerCustomer = async (data: {
  email?: string;
  phone?: string;
  password: string;
}) => {
  // Check if user already exists
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 400);
  }
  if (data.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) throw new AppError('Phone already registered', 400);
  }

  const passwordHash = await hashPassword(data.password);
  const verificationCode = generateVerificationCode();
  const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const user = await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: UserRole.CUSTOMER,
      verified: false,
      verificationCode,
      verificationExpiry,
    },
  });

  // Send verification code
  if (data.email) {
    await sendVerificationEmail(data.email, verificationCode);
  } else if (data.phone) {
    await sendVerificationSMS(data.phone, verificationCode);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const login = async (emailOrPhone: string, password: string) => {
  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    },
    include: {
      ownedRestaurants: true,
    },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  // Store refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return {
    user,
    restaurant: user.ownedRestaurants[0] || null,
    accessToken,
    refreshToken,
  };
};

export const verifyCode = async (userId: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.verified) {
    throw new AppError('User already verified', 400);
  }

  if (!user.verificationCode || !user.verificationExpiry) {
    throw new AppError('No verification code found', 400);
  }

  if (new Date() > user.verificationExpiry) {
    throw new AppError('Verification code expired', 400);
  }

  if (user.verificationCode !== code) {
    throw new AppError('Invalid verification code', 400);
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: userId },
    data: {
      verified: true,
      verificationCode: null,
      verificationExpiry: null,
    },
  });

  return { success: true };
};

export const resendVerificationCode = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.verified) {
    throw new AppError('User already verified', 400);
  }

  const verificationCode = generateVerificationCode();
  const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { verificationCode, verificationExpiry },
  });

  // Send verification code
  if (user.email) {
    await sendVerificationEmail(user.email, verificationCode);
  } else if (user.phone) {
    await sendVerificationSMS(user.phone, verificationCode);
  }

  return { success: true };
};

export const refreshAccessToken = async (token: string) => {
  try {
    const decoded = verifyRefreshToken(token);
    
    // Verify token is still valid in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token', 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);

    return { accessToken };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

export const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });

  return { success: true };
};

