# 🚀 Test Automater Platform - Quick Reference

## Installation (1 minute)

```bash
# Frontend
cd frontend && npm install

# Backend  
cd ../backend && npm install
```

## Running the Platform (3 terminals)

### Terminal 1 - Frontend
```bash
cd frontend
npm run dev
# → http://localhost:5173
```

### Terminal 2 - Backend
```bash
cd backend
npm start
# → http://localhost:5000
```

### Terminal 3 - Demo Site
```bash
cd demo-site
node server.js
# → http://localhost:4000/login
```

## Demo Credentials
```
Username: testuser
Password: pass123
```

## Key Features at a Glance

| Feature | Purpose |
|---------|---------|
| 👥 Users | Manage platform users |
| 📍 Selectors | Define page element selectors (CSS/XPath) |
| ⚙️ Functions | Write automation code in JavaScript |
| 🎯 Scenarios | Combine functions into test flows |
| ▶️ Runs | Configure and execute scenarios |
| 📊 Results | View logs and execution results |
| ⚡ Settings | Configure integrations (ADO, Teams, Email) |

## Writing Your First Function

1. Go to **Functions** page
2. Click **Create Function**
3. Name: `LoginToApp`
4. Code example:
```javascript
async function LoginToApp(page, vars, selectors) {
  await page.goto(vars.baseUrl + "/login");
  await page.fill(selectors.login_username, vars.username);
  await page.fill(selectors.login_password, vars.password);
  await page.click(selectors.login_button);
  await page.waitForSelector(selectors.success_message, { timeout: 5000 });
  return { success: true, message: 'Login successful' };
}
```

## Function Context

Functions automatically receive:
- **page** → Playwright browser page object
- **vars** → Runtime variables (username, password, baseUrl, etc.)
- **selectors** → Your defined CSS/XPath selectors

## Quick Workflow

1. **Define Selectors** → Where are the buttons/inputs?
2. **Create Functions** → What should the bot do?
3. **Build Scenarios** → In what order?
4. **Configure Runs** → With what data?
5. **Execute & Monitor** → View results

## File Structure

```
test-automation-framework/
├── frontend/           # React UI (port 5173)
├── backend/            # Express API (port 5000)
├── demo-site/          # Demo app (port 4000)
├── README.md           # Full documentation
└── PROJECT_SUMMARY.md  # What was created
```

## Common Tasks

### View Mock Data
Edit `frontend/src/mock/mockData.js`

### Change API URL
Edit `frontend/src/api/api.js` - `API_BASE_URL`

### Stop Services
Press `Ctrl+C` in each terminal

### Reset Data
Backend keeps data in memory - restart to reset

### View Browser Automation in Action
Set run mode to **"headed"** instead of **"headless"**

## Troubleshooting

**Port already in use?**
```bash
# Find what's using the port
lsof -i :5173  # Frontend
lsof -i :5000  # Backend
lsof -i :4000  # Demo site

# Kill process
kill -9 <PID>
```

**Dependencies not installing?**
```bash
# Clear cache and try again
rm -rf node_modules package-lock.json
npm install
```

**Can't connect to API?**
- Make sure backend is running
- Check that port 5000 is open
- Check browser console for errors

## Documentation

- **Full README**: See `README.md`
- **Project Details**: See `PROJECT_SUMMARY.md`
- **API Endpoints**: See `backend/src/server.js`
- **Components**: Check `frontend/src/pages/` directory

## Next Steps

1. ✅ Installation complete
2. ✅ All services running
3. ⏭️ Create your first selector
4. ⏭️ Write your first function
5. ⏭️ Build your first scenario
6. ⏭️ Execute and view results!

---

**You're all set! 🎉**

Happy automating! 🤖
