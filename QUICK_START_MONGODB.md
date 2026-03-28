# 🚀 Quick Start - Functional Version with MongoDB & Playwright

## What's New? ✨

Your Test Automation Tool is now **fully functional** with:

✅ **MongoDB Database** - All data persists in MongoDB  
✅ **Real Playwright Execution** - Actually launches browsers and runs automation  
✅ **Complete REST API** - Full CRUD operations for all entities  
✅ **Execution Engine** - Orchestrates scenario execution with detailed logging  
✅ **Result Tracking** - Captures all execution results and logs  

---

## 🎯 Quick Start (5 minutes)

### Prerequisites
- **Node.js 16+** installed
- **MongoDB** (local or MongoDB Atlas)

### 1. Start MongoDB

**If MongoDB is installed locally:**
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Verify it's running
mongosh
# Type: exit
```

**Or use MongoDB Atlas (Cloud):**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account & cluster
3. Copy connection string
4. Update `backend/.env` → `MONGODB_URI`

### 2. Install & Start Everything

```bash
# Make script executable
chmod +x START_ALL.sh

# Run automated setup (installs deps, seeds DB, starts all services)
./START_ALL.sh
```

**Or manual startup:**

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 📋 API Endpoints

### Health & Status
```
GET  /api/health              - Check API status
```

### Resources Management
```
GET    /api/users             - List all users
POST   /api/users             - Create user
PUT    /api/users/:id         - Update user
DELETE /api/users/:id         - Delete user

GET    /api/selectors         - List selectors
POST   /api/selectors         - Create selector
PUT    /api/selectors/:id     - Update selector
DELETE /api/selectors/:id     - Delete selector

GET    /api/functions         - List functions
POST   /api/functions         - Create function
PUT    /api/functions/:id     - Update function
DELETE /api/functions/:id     - Delete function

GET    /api/scenarios         - List scenarios
POST   /api/scenarios         - Create scenario
PUT    /api/scenarios/:id     - Update scenario
DELETE /api/scenarios/:id     - Delete scenario
```

### Execution & Results
```
GET    /api/runs              - List all runs
POST   /api/runs              - Create run
PUT    /api/runs/:id          - Update run
DELETE /api/runs/:id          - Delete run
POST   /api/runs/:id/execute  - ▶️ EXECUTE SCENARIO (Real Playwright!)
GET    /api/runs/:id/results  - Get execution results

GET    /api/results           - All results
GET    /api/results/run/:runId - Results for specific run
```

---

## 🎬 Example: Create & Run a Test

### Step 1: Create a Selector
```bash
curl -X POST http://localhost:5000/api/selectors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "username_field",
    "value": "#username",
    "page": "login",
    "type": "css"
  }'
# Copy the returned _id
```

### Step 2: Create a Function
```bash
curl -X POST http://localhost:5000/api/functions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MyLoginFunction",
    "description": "Login test",
    "code": "async function MyLoginFunction(page, vars, selectors) { await page.goto(vars.baseUrl); await page.fill(selectors.username_field, vars.username); return { success: true, message: \"Form filled\" }; }",
    "status": "Active"
  }'
# Copy the returned _id
```

### Step 3: Create a Scenario
```bash
curl -X POST http://localhost:5000/api/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Login Test",
    "functionIds": ["<function_id_from_step2>"],
    "status": "Active"
  }'
# Copy the returned _id
```

### Step 4: Create a Run
```bash
curl -X POST http://localhost:5000/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "<scenario_id_from_step3>",
    "environment": "staging",
    "mode": "headless",
    "browserType": "chromium",
    "variables": {
      "baseUrl": "http://localhost:3001",
      "username": "test@example.com"
    },
    "iterations": 1
  }'
# Copy the returned _id
```

### Step 5: Execute the Scenario! 🎬
```bash
curl -X POST http://localhost:5000/api/runs/<run_id_from_step4>/execute
```

### Step 6: Check Results
```bash
# In a loop to see live results
watch -n 1 "curl -s http://localhost:5000/api/runs/<run_id>/results | jq"
```

---

## 📊 Database Schema

All data is now stored in **MongoDB** with these collections:

- **Users** - Platform users with roles
- **Selectors** - CSS/XPath selectors organized by page
- **Functions** - JavaScript automation code
- **Scenarios** - Collections of functions to execute in order
- **Runs** - Test execution configurations
- **Results** - Execution results with logs, duration, status
- **Settings** - Application configuration

---

## 🎨 Function Examples

### Simple Navigation & Assertion
```javascript
async function CheckPageTitle(page, vars, selectors) {
  const title = await page.title();
  const hasTitle = title.includes('Expected');
  return { 
    success: hasTitle, 
    message: hasTitle ? 'Title correct' : 'Title incorrect',
    data: { pageTitle: title }
  };
}
```

### Fill Form
```javascript
async function FillLoginForm(page, vars, selectors) {
  await page.fill(selectors.username_field, vars.username);
  await page.fill(selectors.password_field, vars.password);
  await page.click(selectors.login_button);
  await page.waitForNavigation();
  return { success: true, message: 'Form submitted' };
}
```

### With Error Handling
```javascript
async function SafeNavigation(page, vars, selectors) {
  try {
    await page.goto(vars.baseUrl, { waitUntil: 'networkidle' });
    await page.waitForSelector(selectors.main_content);
    return { success: true, message: 'Page loaded' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

---

## 🔧 Configuration & Environment

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/test-automation-tool
PLAYWRIGHT_TIMEOUT=30000
PLAYWRIGHT_HEADLESS=true
```

---

## 📚 Full Documentation

For complete setup, troubleshooting, and advanced features see:
→ [SETUP_MONGODB.md](./SETUP_MONGODB.md)

---

## 🚨 Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check if MongoDB is running
mongosh

# Or start it
brew services start mongodb-community  # macOS
sudo systemctl start mongod             # Linux
```

### "Port already in use"
```bash
# Kill process on port 5000
lsof -i :5000
kill -9 <PID>

# Kill process on port 5173
lsof -i :5173
kill -9 <PID>
```

### "Database seed failed"
```bash
cd backend
npm run seed
```

### Check API is working
```bash
curl http://localhost:5000/api/health
```

---

## 📁 Project Structure

```
test-automation-tool/
├── backend/                          # Node.js + Express
│   ├── src/
│   │   ├── server.js                 # Main server
│   │   ├── models/                   # MongoDB schemas
│   │   ├── controllers/              # Business logic
│   │   ├── routes/                   # API routes
│   │   ├── services/                 # Playwright, Execution
│   │   └── utils/                    # Utilities
│   ├── .env                          # Configuration
│   └── seed.js                       # Database seeding
├── frontend/                         # React + Vite
│   └── src/
│       ├── pages/                    # UI pages
│       ├── components/               # React components
│       └── api/                      # API client
├── demo-site/                        # Sample website for testing
├── SETUP_MONGODB.md                  # Detailed setup guide
└── START_ALL.sh                      # Automated startup script
```

---

## ✅ What Works Now

- ✅ Real database (MongoDB) instead of mock data
- ✅ Full CRUD operations for all resources
- ✅ Real Playwright browser automation
- ✅ Multiple browser support (Chromium, Firefox, WebKit)
- ✅ Scenario execution with multiple functions
- ✅ Result tracking and logging
- ✅ Multiple iterations per run
- ✅ Headless and headed modes
- ✅ Proper error handling and recovery
- ✅ Async execution engine
- ✅ Frontend connected to real API

---

## ❓ Questions?

Check the logs in the terminal where services are running:

```
[2024-XX-XX...] ✓ MongoDB connected successfully
[2024-XX-XX...] ✓ Test Automation API running on http://localhost:5000
[2024-XX-XX...] ========== STARTING EXECUTION ==========
[2024-XX-XX...] ✓ Browser launched: chromium
...
```

All execution details are printed to console in real-time!

---

**Happy Testing! 🎉**
