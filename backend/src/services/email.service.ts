import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

const initializeTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    logger.info('Email transporter initialized');
  } else {
    logger.warn('Email configuration not found, email sending disabled');
  }
};

initializeTransporter();

export const sendVerificationEmail = async (email: string, code: string) => {
  if (!transporter) {
    logger.warn('Email not configured, verification code:', code);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@restaurantmanager.com',
      to: email,
      subject: 'Restaurant Manager - Verify Your Email',
      html: `
        <h1>Welcome to Restaurant Manager!</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 15 minutes.</p>
      `,
    });
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error('Failed to send verification email:', error);
    throw error;
  }
};

