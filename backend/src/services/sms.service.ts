import twilio from 'twilio';
import { logger } from '../utils/logger';

let twilioClient: twilio.Twilio | null = null;

const initializeTwilio = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info('Twilio client initialized');
  } else {
    logger.warn('Twilio configuration not found, SMS sending disabled');
  }
};

initializeTwilio();

export const sendVerificationSMS = async (phone: string, code: string) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    logger.warn('SMS not configured, verification code:', code);
    return;
  }

  try {
    await twilioClient.messages.create({
      body: `Your Restaurant Manager verification code is: ${code}. It will expire in 15 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
    logger.info(`Verification SMS sent to ${phone}`);
  } catch (error) {
    logger.error('Failed to send verification SMS:', error);
    throw error;
  }
};

