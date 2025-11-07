# Environment Setup Guide

## ⚠️ Important: Node.js Version

This project **requires Node.js 20+** but your system has Node.js 18.12.0.

We've installed Node.js 20.19.5 via Homebrew at: `/opt/homebrew/opt/node@20/bin/node`

## 🎯 Three Ways to Handle This

### Option 1: Use the Startup Scripts (Easiest) ✅

The startup scripts automatically set the correct Node.js version:

```bash
# Start everything
./start-all.sh

# Or start individually
./start-backend.sh
./start-mobile.sh
```

### Option 2: Export PATH in Each Terminal Session

Before running any yarn/node commands:

```bash
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
```

Then run your commands:
```bash
cd backend
yarn dev
```

### Option 3: Make Node 20 Permanent (Recommended for Development)

Add to your `~/.zshrc` file:

```bash
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Then verify:
```bash
node --version  # Should show v20.19.5
```

## 🤖 AI Assistant Rules

A `.cursorrules` file has been created in the project root. This tells the AI assistant to:

1. **Always export the Node 20 PATH** before running commands
2. **Use yarn** (not npm) for all package management
3. **Start PostgreSQL** before running the backend
4. **Reference the startup scripts** when helping with setup

## 📋 Environment Variables Checklist

### Backend (`backend/.env`)
- ✅ `DATABASE_URL` - PostgreSQL connection string
- ✅ `JWT_SECRET` - Secret for JWT tokens
- ✅ `PORT` - Server port (default: 3000)
- ✅ `NODE_ENV` - Environment mode
- ⚠️ `SMTP_*` - Email settings (optional, warnings shown if missing)
- ⚠️ `TWILIO_*` - SMS settings (optional, warnings shown if missing)

### Mobile (`mobile/.env`)
- Currently uses hardcoded `http://localhost:3000` for development
- No .env file needed for local development

## 🔍 Verifying Your Setup

Run these commands to verify everything is configured correctly:

```bash
# Check Node version
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
node --version
# Should output: v20.19.5

# Check PostgreSQL
brew services list | grep postgresql
# Should show: postgresql@14 started

# Check Prisma version
cd backend
yarn list --pattern prisma | grep prisma@
# Should show: prisma@6.19.0

# Test backend health
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

## 🚀 Starting the Application

### Method 1: All-in-One Script (Recommended)
```bash
./start-all.sh
```

**Behavior:**
- Backend runs in background, logs to `/tmp/backend.log`
- Mobile app shows **live logs** in terminal
- Press `Ctrl+C` to stop both services
- View backend logs: `tail -f /tmp/backend.log`

### Method 2: Individual Services (Separate Terminals)
```bash
# Terminal 1: Backend (shows live logs)
./start-backend.sh

# Terminal 2: Mobile (shows live logs)
./start-mobile.sh
```

**Behavior:**
- Each service shows **live logs** in its own terminal
- Press `Ctrl+C` in each terminal to stop

### Method 3: Manual Start (with exports)
```bash
# Terminal 1: Backend
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd backend
yarn dev

# Terminal 2: Mobile  
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
cd mobile
npx expo start --clear --ios
```

### Viewing Logs

**Backend logs (if running via start-all.sh):**
```bash
tail -f /tmp/backend.log
```

**Mobile logs:**
- Always shown live in the terminal where Expo is running
- Look for bundling errors, Metro bundler status, and app errors

## 🐛 Common Issues

### "The engine 'node' is incompatible with this module"
- **Cause**: Forgot to export the PATH
- **Fix**: Run `export PATH="/opt/homebrew/opt/node@20/bin:$PATH"`

### "ECONNREFUSED ::1:5432"
- **Cause**: PostgreSQL not running
- **Fix**: Run `brew services start postgresql@14`

### "P1010: User was denied access"
- **Cause**: DATABASE_URL doesn't include the username
- **Fix**: Already fixed in backend/.env (includes `johnpark@`)

### Mobile app not showing in simulator
- **Cause**: Metro bundler still loading or app not installed
- **Fix**: Wait for QR code, then press `i` to open iOS simulator

## 📊 Current Status

✅ **Node.js 20.19.5** - Installed via Homebrew  
✅ **PostgreSQL 14** - Running via Homebrew services  
✅ **Prisma 6.19.0** - Latest version installed  
✅ **Backend** - Running on port 3000  
✅ **Mobile** - Expo ready for iOS simulator  
✅ **Startup Scripts** - Created and executable  
✅ **Cursor Rules** - AI assistant configured  
✅ **README** - Updated with environment setup

## 🗄️ Database Connection (for IDE)

### **PostgreSQL Connection Details:**
- **Host:** `localhost`
- **Port:** `5432`
- **Database:** `restaurant_manager`
- **Username:** `johnpark`
- **Password:** *(empty - using peer authentication)*
- **Schema:** `public`

### **Connection String:**
```
postgresql://johnpark@localhost:5432/restaurant_manager?schema=public
```

### **Tables:**
- User, Restaurant, MenuItem, Order, OrderItem, OrderQueue, Transaction

### **CLI Access:**
```bash
psql -U johnpark -d restaurant_manager
```

---

## 📝 Notes for Future Sessions

When you ask the AI assistant to "start the app", it will now:

1. ✅ Export PATH to use Node 20
2. ✅ Check if PostgreSQL is running
3. ✅ Start the backend with proper environment
4. ✅ Start the mobile app with proper environment
5. ✅ Provide logs and health checks

No more manual environment configuration needed! 🎉

---

## 🔧 Maintaining Documentation

### `.cursorrules` File (AI Assistant Rules)
The `.cursorrules` file contains important rules for the AI assistant. It's designed to be **self-maintaining**:

**Meta-Rules:**
1. **Document Workarounds** - When a fix is found, it's added to the file
2. **Replace, Don't Append** - Old/obsolete rules are removed when new solutions are found
3. **Keep Current** - Rules are reviewed and consolidated regularly

**What's Documented:**
- Environment setup requirements
- Common issues and their solutions
- Workarounds for package conflicts
- Troubleshooting steps

### `.gitignore` Files
The project maintains **three levels** of .gitignore:

1. **Root `.gitignore`** - Project-wide ignores (node_modules, logs, OS files)
2. **`backend/.gitignore`** - Backend-specific (dist, uploads, .env, Prisma)
3. **`mobile/.gitignore`** - Mobile-specific (.expo, iOS/Android builds, certificates)

**Auto-maintained:** When new files/folders are created that shouldn't be tracked, they're automatically added to the appropriate .gitignore.

