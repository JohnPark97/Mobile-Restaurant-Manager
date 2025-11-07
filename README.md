# Mobile Restaurant Manager

A comprehensive restaurant management system built with React Native and Node.js, designed for BC Canada restaurant owners to manage their operations and comply with tax regulations.

## 🚀 Features

### For Restaurant Owners
- **Self-Service Registration**: Register your restaurant without approval (auto-approved)
- **Menu Management**: Add, edit, and manage menu items with pricing and photos
- **Order Management**: Track table and online orders in real-time
- **Transaction Tracking**: Complete transaction history with GST/PST breakdown
- **Tax Compliance**: Built-in BC Canada tax compliance (5% GST, 7% PST)
- **Tax Reports**: Generate tax summaries for CRA filing
- **Real-Time Updates**: Socket.IO integration for live order status

### For Customers
- **Browse Restaurants**: Discover available restaurants
- **Place Orders**: Order for table service or online pickup
- **Real-Time Tracking**: Track order status with queue position
- **Order History**: View all past orders

## 📋 Tech Stack

### Frontend (Mobile)
- **React Native** 0.76.5 with **Expo** 52.0
- **TypeScript** for type safety
- **React Navigation** 7.x for routing
- **TanStack Query** (React Query) for data fetching
- **Zustand** for state management
- **Socket.IO Client** for real-time updates
- **NativeWind** (Tailwind CSS for React Native)

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **Prisma** ORM with **PostgreSQL**
- **Socket.IO** for real-time features
- **JWT** authentication
- **bcryptjs** for password hashing
- **Zod** for validation
- **Winston** for logging
- **Multer + Sharp** for image uploads

## 🏗️ Project Structure

```
mobile_restaurant_manager/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/        # Helpers (tax, crypto, validation)
│   ├── prisma/           # Database schema
│   └── package.json
├── mobile/               # React Native app
│   ├── src/
│   │   ├── screens/      # UI screens
│   │   ├── navigation/   # App navigation
│   │   ├── store/        # State management
│   │   └── config/       # Configuration
│   └── package.json
└── shared/               # Shared TypeScript types
    └── types/
```

## 🚀 Quick Start (Recommended)

This project includes convenient startup scripts that automatically configure the environment:

### Start Everything at Once
```bash
./start-all.sh
```
This script:
- ✓ Ensures Node.js 20 is used
- ✓ Starts PostgreSQL if not running
- ✓ Launches backend server
- ✓ Opens mobile app in iOS simulator

### Start Individual Services

**Backend only:**
```bash
./start-backend.sh
```

**Mobile app only:**
```bash
./start-mobile.sh
```

---

## 🔧 Manual Setup Instructions

### Prerequisites
- **Node.js 20+** (installed via `brew install node@20`)
- PostgreSQL 14+
- Yarn (package manager)
- iOS Simulator (Mac) or Android Studio for mobile development

### Important: Environment Variables

This project requires **Node.js 20** (not the system Node 18). When running commands manually, always export the PATH:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

Or add this to your `~/.zshrc`:
```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Backend Setup

1. **Install dependencies:**
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd backend
yarn install
```

2. **Setup PostgreSQL database:**
```bash
# Create database
createdb restaurant_manager

# Or using psql
psql -U postgres
CREATE DATABASE restaurant_manager;
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

4. **Run database migrations:**
```bash
yarn prisma:migrate
yarn prisma:generate
```

5. **Start backend server:**
```bash
yarn dev
# Server runs on http://localhost:3000
```

### Mobile App Setup

1. **Install dependencies:**
```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd mobile
yarn install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Update API_BASE_URL if needed
```

3. **Start Expo development server:**
```bash
yarn start
```

4. **Run on device/simulator:**
```bash
# iOS (Mac only)
yarn ios

# Android
yarn android

# Web (for testing)
yarn web
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register/owner` - Register restaurant owner
- `POST /api/auth/register/customer` - Register customer
- `POST /api/auth/login` - Login
- `POST /api/auth/verify` - Verify email/phone
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `PUT /api/restaurants/:id` - Update restaurant (owner only)

### Menu
- `GET /api/menu/restaurant/:restaurantId` - Get menu items
- `POST /api/menu/restaurant/:restaurantId` - Add menu item (owner)
- `PUT /api/menu/:id` - Update menu item (owner)
- `DELETE /api/menu/:id` - Delete menu item (owner)
- `POST /api/menu/upload` - Upload menu image (owner)

### Orders
- `POST /api/orders` - Create order (customer)
- `GET /api/orders/my-orders` - Get customer orders
- `GET /api/orders/restaurant/:restaurantId` - Get restaurant orders (owner)
- `PATCH /api/orders/:id/status` - Update order status (owner)
- `GET /api/orders/restaurant/:restaurantId/queue` - Get order queue

### Transactions
- `GET /api/transactions/restaurant/:restaurantId` - Get transactions (owner)
- `GET /api/transactions/restaurant/:restaurantId/sales-report` - Sales report
- `GET /api/transactions/restaurant/:restaurantId/tax-summary` - Tax summary
- `GET /api/transactions/restaurant/:restaurantId/export` - Export transactions

## 🔐 Authentication Flow

1. **Owner Registration:**
   - Provide email/phone, password, and restaurant details
   - Receive verification code via email/SMS
   - Verify account
   - Auto-approved (FUTURE: admin approval before going live)

2. **Customer Registration:**
   - Provide email/phone and password
   - Receive verification code
   - Verify account

3. **Login:**
   - Returns access token (15min) and refresh token (7 days)
   - Refresh token for seamless re-authentication

## 📊 BC Canada Tax Compliance

The system automatically handles BC tax requirements:

- **GST (5%)**: Federal Goods and Services Tax
- **PST (7%)**: BC Provincial Sales Tax
- **Tips**: Tracked separately (not taxable)
- **Transaction Records**: Stored for 5+ years (CRA requirement)
- **Receipt Generation**: Unique receipt numbers per transaction
- **Tax Reports**: Generate GST/PST summaries by fiscal year

## 🔄 Real-Time Features

Socket.IO powers real-time updates:

- Order status changes
- Queue position updates
- New order notifications for owners
- Live order tracking for customers

## 🚀 Deployment

### Backend Deployment (Railway/DigitalOcean/AWS)

1. Set environment variables on hosting platform
2. Connect PostgreSQL database
3. Run migrations: `yarn prisma:migrate`
4. Deploy with: `yarn build && yarn start`

### Mobile App Deployment

1. **Build for production:**
```bash
# iOS
npx eas build --platform ios

# Android
npx eas build --platform android
```

2. **Submit to stores:**
```bash
npx eas submit
```

## 📱 App Navigation

### Owner Flow
- Dashboard → View stats and quick actions
- Menu → Manage menu items
- Orders → View and manage orders
- Finance → View transactions and tax reports
- Profile → Account settings

### Customer Flow
- Browse → Restaurant list and menus
- Cart → Review and modify order
- Checkout → Place order (table/online)
- My Orders → Order history and tracking
- Profile → Account settings

## 🔮 Future Enhancements (Noted in Code)

1. **Payment Integration** - Stripe/Square for card payments
2. **Admin Approval** - Restaurant verification before going live
3. **Advanced Analytics** - Sales trends, popular items
4. **Loyalty Program** - Customer rewards
5. **Multi-language Support** - French for BC compliance
6. **QR Code Ordering** - Table-side ordering via QR codes

## 🧪 Testing

```bash
# Backend
cd backend
yarn test

# Mobile
cd mobile
yarn test
```

## 📝 Development Notes

- Use latest packages and frameworks (as of Nov 2025)
- TypeScript strict mode enabled
- Shared types between frontend and backend
- Comprehensive error handling
- JWT-based authentication
- Rate limiting on API endpoints
- Image optimization for menu photos

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env
DATABASE_URL="postgresql://user:password@localhost:5432/restaurant_manager"
```

### Expo Development Issues
```bash
# Clear cache
yarn start --clear

# Reinstall dependencies
rm -rf node_modules && yarn install
```

### API Connection Issues
- Ensure backend is running on correct port
- Update `API_BASE_URL` in mobile/src/config/api.ts
- Check firewall/network settings

## 📄 License

ISC

## 👥 Contributing

This is a private project for BC Canada restaurant management.

## 📧 Support

For issues or questions, please refer to the inline code documentation or contact the development team.

---

**Built with ❤️ for BC Canada Restaurant Owners**
