# Test Automater Platform 🤖

A comprehensive UI-based configurable test automation framework where users can create reusable automation functions and build test scenarios without writing scripts repeatedly.

## Features

✨ **Key Features:**
- 🎯 No-code scenario builder - Create test scenarios by combining pre-built functions
- 📝 Code editor for automation functions - Write JavaScript functions to automate browser interactions
- 🗂️ Selector management - Define CSS/XPath selectors for page elements
- 👥 User management - Manage users and their roles
- 🎬 Scenario execution - Run test scenarios with configurable options
- 📊 Results tracking - View execution results and detailed logs
- 🔗 Integration support - ADO, Teams, and Email notifications
- 🎨 Modern UI - Built with Material-UI and React
- 🌐 Local deployment - Runs completely on your machine

## Project Structure

```
test-automation-framework/
├── frontend/                 # React + Vite SPA
│   ├── src/
│   │   ├── pages/           # UI pages
│   │   ├── components/      # Reusable components
│   │   ├── layout/          # Layout components
│   │   ├── api/             # API client
│   │   ├── mock/            # Mock data
│   │   └── App.jsx          # Main app
│   └── package.json
├── backend/                  # Node.js + Express API
│   ├── src/
│   │   ├── server.js        # Express server
│   │   └── executionEngine.js # Playwright integration
│   └── package.json
├── demo-site/               # Demo login page
│   ├── login.html           # Login page
│   └── server.js            # Demo server
└── README.md
```

## Pages & Features

### Dashboard
- Overview of users, functions, scenarios, and results
- Quick statistics and recent execution results
- Quick action buttons

### Users
- Manage platform users
- Assign roles (Admin, QA Engineer, Developer, Test Engineer)
- Set user status (Active/Inactive)

### Selectors
- Define CSS/XPath selectors for page elements
- Organize by page and functionality
- Reference selectors in automation functions

### Functions
- Create automation functions using JavaScript
- Access to Playwright browser APIs
- Full code editor with syntax highlighting
- Functions receive: `page`, `vars`, `selectors`

### Scenarios
- Combine multiple functions into test scenarios
- Order functions for sequential execution
- Rename, edit, and manage scenarios

### Runs
- Configure scenario execution
- Set runtime variables (username, password, baseUrl, etc.)
- Choose environment (staging, production, development)
- Select execution mode (headless, headed)
- Run tests single or multiple times

### Results
- View detailed execution results
- See logs for each execution
- Download results as JSON
- Track success/failure rates

### Settings
- **ADO Settings**: Configure Azure DevOps integration
- **Teams Settings**: Set up Microsoft Teams webhook for notifications
- **Email Settings**: Configure email notifications for test results

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Playwright (auto-installed via npm)

### Installation

1. **Clone the repository** (if from git):
```bash
cd test-automation-framework
```

2. **Install Frontend Dependencies**:
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**:
```bash
cd ../backend
npm install
```

4. **Install Demo Site Dependencies**:
```bash
cd ../demo-site
npm install  # If needed, or use npm from parent
```

### Running the Platform

**Terminal 1 - Frontend (Vite Dev Server)**:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**Terminal 2 - Backend (Express API)**:
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

**Terminal 3 - Demo Site**:
```bash
cd demo-site
node server.js
# Runs on http://localhost:4000/login
```

Open your browser to `http://localhost:5173` to access the Test Automater Platform.

## Writing Automation Functions

### Function Template

```javascript
async function YourFunctionName(page, vars, selectors) {
  try {
    // Use page (Playwright browser page object)
    await page.goto(vars.baseUrl + "/path");
    
    // Use selectors defined in the selector manager
    await page.fill(selectors.login_username, vars.username);
    
    // Use runtime variables
    await page.click(selectors.login_button);
    
    // Wait for elements
    await page.waitForSelector(selectors.success_message, { timeout: 5000 });
    
    return { success: true, message: 'Action completed successfully' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
```

### Available APIs

**Page Object (Playwright)**:
- `page.goto(url)` - Navigate to URL
- `page.fill(selector, text)` - Fill input field
- `page.click(selector)` - Click element
- `page.waitForSelector(selector, options)` - Wait for element
- `page.textContent(selector)` - Get text content
- `page.title()` - Get page title
- And more... [Playwright Docs](https://playwright.dev/)

**Runtime Variables** (`vars`):
- `vars.username` - Username from run configuration
- `vars.password` - Password from run configuration
- `vars.baseUrl` - Base URL from run configuration
- `vars.expectedText` - Expected text to validate
- Custom variables you define in run configuration

**Selectors** (`selectors`):
- Access selectors defined in the Selector Manager
- Example: `selectors.login_username` returns `#username`

## Demo Login Page

The demo site at `http://localhost:4000/login` includes:

**Demo Credentials**:
- Username: `testuser`
- Password: `pass123`

This page can be tested using automation functions. The pre-filled example function `LoginToApp` demonstrates how to automate the login process.

## Example Scenario

**Creating a Login Flow Scenario**:

1. Create Selector `login_username` → `#username`
2. Create Selector `login_password` → `#password`
3. Create Selector `login_button` → `#loginBtn`
4. Create Function `LoginToApp` with login automation code
5. Create Function `ValidateHomePage` with validation code
6. Create Scenario combining these functions
7. Configure a Run with the scenario and demo site baseUrl
8. Execute the Run and view Results

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Selectors
- `GET /api/selectors` - Get all selectors
- `POST /api/selectors` - Create selector
- `PUT /api/selectors/:id` - Update selector
- `DELETE /api/selectors/:id` - Delete selector

### Functions
- `GET /api/functions` - Get all functions
- `POST /api/functions` - Create function
- `PUT /api/functions/:id` - Update function
- `DELETE /api/functions/:id` - Delete function

### Scenarios
- `GET /api/scenarios` - Get all scenarios
- `POST /api/scenarios` - Create scenario
- `PUT /api/scenarios/:id` - Update scenario
- `DELETE /api/scenarios/:id` - Delete scenario

### Runs
- `GET /api/runs` - Get all runs
- `POST /api/runs` - Create run
- `PUT /api/runs/:id` - Update run
- `DELETE /api/runs/:id` - Delete run

### Results
- `GET /api/results` - Get all results
- `POST /api/results` - Create result
- `DELETE /api/results/:id` - Delete result

### Execution
- `POST /api/execute/:scenarioId` - Execute scenario

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings

## Frontend Features

### Mock Data
The frontend includes comprehensive mock data in `src/mock/mockData.js`. The UI works completely independently using this data, making the frontend functional even without the backend.

### Offline Mode
To run frontend with mock data only:
```bash
# In frontend/.env or vite.config.js
VITE_USE_MOCK_DATA=true
```

This allows testing the UI without running the backend.

## Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Material-UI (MUI)** - Component library
- **Monaco Editor** - Code editor for functions
- **React Router** - Page routing
- **Axios** - HTTP client

### Backend
- **Express.js** - Web framework
- **Playwright** - Browser automation
- **Node.js 16+** - Runtime

### Demo Site
- **Express.js** - Web framework
- **HTML/CSS/JavaScript** - Static pages

## Configuration

### Backend Configuration
Create a `.env` file in the backend directory:
```
PORT=5000
NODE_ENV=development
```

### Frontend Configuration
The frontend automatically detects the backend:
- With backend: `http://localhost:5000/api`
- Mock mode: Enable `VITE_USE_MOCK_DATA=true`

## Development Tips

- **Reload Functions**: Use the Functions page to reload function definitions after editing
- **Debug Logs**: Check the Results page for detailed execution logs
- **Test Selectors**: Use the browser's DevTools to verify CSS selectors work
- **Variable Testing**: Create test runs with different runtime variables
- **Headless vs Headed**: Use headed mode for debugging, headless for CI/CD

## Limitations & Future Enhancements

### Current Limitations
- In-memory data storage (no persistence)
- No database integration yet
- Simple authentication (mock users)
- Local execution only

### Planned Features
- Database integration (MongoDB/PostgreSQL)
- User authentication
- Test reports and dashboards
- CI/CD pipeline integration
- Parallel execution
- Test data management
- Advanced error handling
- Performance optimization

## Support & Documentation

For more information:
- Frontend docs in `frontend/README.md`
- Backend structure in `backend/` directory
- Demo site in `demo-site/` directory

## License

This project is created as a test automation framework.

---

**Made with ❤️ for automation engineers**
