# Restaurant Manager Mobile App

Cross-platform mobile application built with React Native and Expo.

## Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn start

# Run on iOS (Mac only)
yarn ios

# Run on Android
yarn android
```

## Scripts

- `yarn start` - Start Expo development server
- `yarn ios` - Run on iOS simulator
- `yarn android` - Run on Android emulator
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── config/          # API configuration
├── navigation/      # Navigation setup
├── screens/         # Screen components
│   ├── auth/        # Authentication screens
│   ├── owner/       # Owner screens
│   └── customer/    # Customer screens
├── store/           # State management (Auth, Cart)
└── components/      # Reusable components
```

## Building for Production

```bash
# Install EAS CLI
yarn global add eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit
```

## Environment Variables

Update `src/config/api.ts` with your backend URL:

```typescript
export const API_BASE_URL = 'https://your-backend-url.com/api';
```

## Features

- Role-based navigation (Owner/Customer)
- Real-time order tracking with Socket.IO
- Persistent authentication with SecureStore
- Optimistic UI updates
- Cart management with Zustand
- Data fetching with TanStack Query

## Troubleshooting

### Clear Cache
```bash
yarn start --clear
```

### Reset Dependencies
```bash
rm -rf node_modules && yarn install
```

