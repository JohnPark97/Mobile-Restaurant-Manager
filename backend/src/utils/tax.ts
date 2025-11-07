// Tax calculation utilities for BC Canada

const GST_RATE = parseFloat(process.env.GST_RATE || '0.05'); // 5%
const PST_RATE = parseFloat(process.env.PST_RATE || '0.07'); // 7%

export interface TaxCalculation {
  subtotal: number;
  gst: number;
  pst: number;
  total: number;
}

export const calculateTaxes = (subtotal: number, tip: number = 0): TaxCalculation => {
  // GST and PST are calculated on subtotal only, not on tips
  const gst = parseFloat((subtotal * GST_RATE).toFixed(2));
  const pst = parseFloat((subtotal * PST_RATE).toFixed(2));
  const total = parseFloat((subtotal + gst + pst + tip).toFixed(2));

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    gst,
    pst,
    total,
  };
};

export const generateReceiptNumber = (restaurantId: string): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `RCP-${restaurantId.substring(0, 8)}-${timestamp}-${random}`;
};

export const getFiscalYear = (date: Date = new Date()): number => {
  return date.getFullYear();
};

