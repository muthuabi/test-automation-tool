# 🚀 Complete Setup Guide - MongoDB & Playwright Integration

This guide will help you set up the fully functional Test Automation Tool with MongoDB and Playwright execution.

## Prerequisites

- **Node.js** 16+ installed
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn** package manager

## Installation Steps

### 1. Install MongoDB (if not already installed)

#### Option A: MongoDB Local Installation
```bash
# macOS (using Homebrew)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify MongoDB is running
mongosh
# Type: exit
```

#### Option B: MongoDB Atlas (Cloud)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a cluster
4. Get your connection string
5. Update `.env` file with your connection string

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already created, verify it has your MongoDB URI)
cat .env

# Seed initial data to MongoDB
npm run seed

# Start backend in development mode
npm run dev

# In another terminal, for production:
npm start
```

**Expected Output:**
```
✓ MongoDB connected successfully
✓ Test Automation API running on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Open new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will be available at http://localhost:5173
```

### 4. Demo Site Setup (Optional)

```bash
# Open another terminal
cd demo-site

# Install dependencies
npm install

# Start demo site
node server.js

# Demo site will be available at http://localhost:3001
```

---

## 🎯 Key Features Now Implemented

### ✅ MongoDB Database
- **Models Created**: Users, Selectors, Functions, Scenarios, Runs, Results, Settings
- **Data Persistence**: All data is stored in MongoDB
- **Initial Seed Data**: Sample users, selectors, functions, and scenarios included

### ✅ REST API Endpoints

#### Users Management
```
GET    /api/users           - Get all users
POST   /api/users           - Create new user
PUT    /api/users/:id       - Update user
DELETE /api/users/:id       - Delete user
```

#### Selectors Management
```
GET    /api/selectors       - Get all selectors
GET    /api/selectors/by-page - Get selectors by page
POST   /api/selectors       - Create new selector
PUT    /api/selectors/:id   - Update selector
DELETE /api/selectors/:id   - Delete selector
```

#### Functions Management
```
GET    /api/functions       - Get all functions
POST   /api/functions       - Create new function
PUT    /api/functions/:id   - Update function
DELETE /api/functions/:id   - Delete function
```

#### Scenarios Management
```
GET    /api/scenarios       - Get all scenarios
POST   /api/scenarios       - Create new scenario
PUT    /api/scenarios/:id   - Update scenario
DELETE /api/scenarios/:id   - Delete scenario
```

#### Runs & Execution
```
GET    /api/runs            - Get all runs
POST   /api/runs            - Create new run
PUT    /api/runs/:id        - Update run
DELETE /api/runs/:id        - Delete run
POST   /api/runs/:id/execute - Execute scenario (REAL Playwright)
GET    /api/runs/:id/results - Get execution results
```

#### Settings
```
GET    /api/settings        - Get all settings
POST   /api/settings        - Create setting
PUT    /api/settings/:id    - Update setting
DELETE /api/settings/:id    - Delete setting
```

### ✅ Playwright Execution Engine

The execution engine (`/backend/src/services/executionEngine.js`) now:

1. **Launches Real Playwright Browser** - Chromium, Firefox, or WebKit
2. **Creates Browser Context** - Isolated browsing session
3. **Creates Pages** - One page per execution
4. **Executes Functions Sequentially** - In the order defined in scenario
5. **Captures Results** - Stores all execution data in MongoDB
6. **Handles Errors** - Graceful error handling and logging
7. **Supports Multiple Iterations** - Run same scenario multiple times
8. **Supports All Browser Types** - Chromium (default), Firefox, WebKit
9. **Headless & Headed Modes** - Configure browser visibility

### ✅ Function Execution

Functions receive three parameters:
```javascript
async function YourFunction(page, vars, selectors) {
  // page: Playwright Page object (full browser API)
  // vars: Runtime variables (username, password, baseUrl, etc.)
  // selectors: DOM selectors as object { name: selector_string }
  
  // Example:
  await page.goto(vars.baseUrl);
  await page.fill(selectors.login_username, vars.username);
  await page.click(selectors.login_button);
  
  return { success: true, message: 'Success', data: {...} };
}
```

---

## 📝 Example: Create and Run a Scenario

### Step 1: Create a User (if not exists)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tester@example.com",
    "name": "Test Automation Engineer",
    "role": "Test Engineer",
    "status": "Active"
  }'
```

### Step 2: Create Selectors
```bash
curl -X POST http://localhost:5000/api/selectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "username_field",
    "value": "#username",
    "page": "login",
    "description": "Username input field",
    "type": "css"
  }'
```

### Step 3: Create a Function
```bash
curl -X POST http://localhost:5000/api/functions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "LoginFunction",
    "description": "Login to the application",
    "code": "async function LoginFunction(page, vars, selectors) { await page.goto(vars.baseUrl); await page.fill(selectors.username_field, vars.username); return { success: true, message: \"Login successful\" }; }",
    "status": "Active"
  }'
```

### Step 4: Create a Scenario
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Scenario",
    "description": "Test login functionality",
    "functionIds": ["<function_id_from_step3>"],
    "status": "Active"
  }'
```

### Step 5: Create and Execute a Run
```bash
# Create run
curl -X POST http://localhost:5000/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "<scenario_id_from_step4>",
    "environment": "staging",
    "mode": "headless",
    "variables": {
      "baseUrl": "http://localhost:3001",
      "username": "testuser@example.com",
      "password": "password123"
    },
    "iterations": 1,
    "browserType": "chromium"
  }'

# Execute the run (replace <run_id> with the ID returned above)
curl -X POST http://localhost:5000/api/runs/<run_id>/execute

# Check results
curl -X GET http://localhost:5000/api/runs/<run_id>/results
```

---

## 🔧 Environment Variables

Edit `.env` file to configure:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/test-automation-tool

# Playwright Configuration
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_HEADLESS=true
PLAYWRIGHT_SLOWMO=0

# Demo Site
DEMO_SITE_URL=http://localhost:3001

# Optional: Email, ADO, Teams settings
SMTP_SERVER=your-smtp.com
ADO_PROJECT_URL=https://dev.azure.com/...
TEAMS_WEBHOOK_URL=https://outlook.webhook.office.com/...
```

---

## 📊 Database Schema

### Users Collection
```
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  role: Enum ['Admin', 'QA Engineer', 'Developer', 'Test Engineer'],
  status: Enum ['Active', 'Inactive'],
  createdAt: Date,
  updatedAt: Date
}
```

### Functions Collection
```
{
  _id: ObjectId,
  name: String (unique),
  description: String,
  code: String (JavaScript function),
  parameters: [String],
  status: Enum ['Active', 'Inactive', 'Testing'],
  version: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Results Collection
```
{
  _id: ObjectId,
  runId: ObjectId (ref: Run),
  scenarioName: String,
  functionName: String,
  status: Enum ['passed', 'failed', 'skipped'],
  startTime: Date,
  endTime: Date,
  duration: Number,
  logs: [String],
  error: String,
  output: Mixed,
  screenshots: [String],
  iteration: Number,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
# macOS
brew services list

# Check connection string
# Try connecting manually
mongosh "mongodb://localhost:27017"
```

### Port Already in Use
```bash
# Backend on port 5000
lsof -i :5000
kill -9 <PID>

# Frontend on port 5173
lsof -i :5173
kill -9 <PID>
```

### Clear Database and Reseed
```bash
cd backend
npm run seed
```

### View Logs
```bash
# Check MongoDB logs
log stream --predicate 'process == "mongod"'

# Check backend logs (running in terminal shows all logs)
```

---

## 🚀 Production Deployment

Before deploying:

1. Set `NODE_ENV=production` in `.env`
2. Update MongoDB connection to production instance
3. Set `PLAYWRIGHT_HEADLESS=true`
4. Configure environment-specific settings
5. Build frontend: `npm run build`
6. Use process manager (PM2) for backend

```bash
# Backend
npm install -g pm2
pm2 start src/server.js --name "test-automation"

# Monitor
pm2 logs test-automation
pm2 status
```

---

## ✨ Next Steps

1. ✅ Backend running with MongoDB
2. ✅ Frontend connected to real API
3. ✅ Playwright execution working
4. ❓ Configure integrations (ADO, Teams, Email)
5. ❓ Add authentication
6. ❓ Add test reports generation
7. ❓ Add CI/CD pipeline integration

---

## 📞 Support

If you encounter issues:

1. Check all three services are running
2. Verify MongoDB is connected
3. Check `.env` configuration
4. Review logs in terminal
5. Ensure ports are not in use

All system logs are printed to the terminal where services are running.
