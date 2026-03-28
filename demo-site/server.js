const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 4000;

// Middleware
app.use(express.static(__dirname));
app.use(express.json());

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Home page (simulated after successful login)
app.get('/home', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Home - Test App</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #f5f5f5;
        }

        .navbar {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .navbar h1 {
          font-size: 24px;
          margin: 0;
        }

        .container {
          max-width: 1000px;
          margin: 40px auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .success-message {
          background-color: #d4edda;
          border: 1px solid #c3e6cb;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
          font-size: 18px;
          font-weight: 600;
        }

        .content {
          color: #333;
          line-height: 1.6;
        }

        .content h2 {
          margin-top: 20px;
          margin-bottom: 10px;
          color: #667eea;
        }

        .content p {
          margin-bottom: 10px;
        }

        button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          margin-top: 20px;
        }

        button:hover {
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="navbar">
        <h1>🏠 Test App Home</h1>
      </div>

      <div class="container">
        <div class="success-message">
          ✓ Login successful!
        </div>

        <div class="content">
          <p>Welcome to the Test Automater Platform Demo Site!</p>
          <p>This is the home page displayed after successful login.</p>

          <h2>What's Next?</h2>
          <p>The Test Automater Platform can now:</p>
          <ul style="margin-left: 20px; margin-bottom: 10px;">
            <li>Execute automated testing scenarios</li>
            <li>Interact with this page and other elements</li>
            <li>Capture results and logs</li>
            <li>Send notifications to ADO, Teams, and Email</li>
          </ul>

          <button id="logoutBtn">← Logout</button>
        </div>
      </div>

      <script>
        document.getElementById('logoutBtn').addEventListener('click', () => {
          window.location.href = '/login';
        });
      </script>
    </body>
    </html>
  `);
});

// Default route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`🌐 Demo Site running on http://localhost:${PORT}/login`);
  console.log(`Demo credentials: testuser / pass123`);
});
