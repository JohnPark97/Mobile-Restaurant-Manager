// Shared TypeScript types between backend and mobile

export enum UserRole {
  OWNER = 'owner',
  CUSTOMER = 'customer',
}

export enum OrderType {
  TABLE = 'table',
  ONLINE = 'online',
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  DIGITAL = 'digital',
}

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  verified: boolean;
  createdAt: Date;
}

export interface Restaurant {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  phone: string;
  taxNumber: string | null;
  approved: boolean; // For future admin approval
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  restaurantId: string;
  customerId: string;
  type: OrderType;
  status: OrderStatus;
  tableNumber: string | null;
  pickupTime: Date | null;
  subtotal: number;
  gst: number;
  pst: number;
  tip: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  orderId: string;
  restaurantId: string;
  paymentMethod: PaymentMethod;
  amount: number;
  gstAmount: number;
  pstAmount: number;
  tipAmount: number;
  transactionDate: Date;
  fiscalYear: number;
  receiptNumber: string;
}

// API Request/Response types
export interface RegisterOwnerRequest {
  email?: string;
  phone?: string;
  password: string;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  taxNumber?: string;
}

export interface RegisterCustomerRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  restaurant?: Restaurant;
  accessToken: string;
  refreshToken: string;
}

export interface CreateMenuItemRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  type: OrderType;
  tableNumber?: string;
  pickupTime?: Date;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
  tip?: number;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & { menuItem: MenuItem })[];
  customer: User;
}

export interface SalesReportResponse {
  period: string;
  totalSales: number;
  totalOrders: number;
  totalGst: number;
  totalPst: number;
  totalTips: number;
  byDay?: { date: string; sales: number; orders: number }[];
}

export interface TaxSummaryResponse {
  fiscalYear: number;
  totalSales: number;
  totalGst: number;
  totalPst: number;
  totalTips: number;
  transactionCount: number;
}

