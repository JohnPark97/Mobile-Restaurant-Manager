# Restaurant Manager Backend

Node.js + Express + TypeScript backend API for the Restaurant Manager application.

## Quick Start

```bash
# Install dependencies
yarn install

# Setup environment
cp .env.example .env

# Run migrations
yarn prisma:migrate
yarn prisma:generate

# Start development server
yarn dev
```

## Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn prisma:migrate` - Run database migrations
- `yarn prisma:generate` - Generate Prisma client
- `yarn prisma:studio` - Open Prisma Studio

## Environment Variables

See `.env.example` for required environment variables.

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key tables:

- **users** - User accounts (owners and customers)
- **restaurants** - Restaurant information
- **menu_items** - Menu items with pricing
- **orders** - Customer orders
- **order_items** - Order line items
- **order_queue** - Online order queue
- **transactions** - Transaction records for tax compliance

## API Documentation

See main README.md for complete API endpoint documentation.

