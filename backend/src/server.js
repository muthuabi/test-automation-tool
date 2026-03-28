const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectDB } = require('./db/connection');
const logger = require('./utils/logger');

// Import routes
const usersRoutes = require('./routes/users');
const selectorsRoutes = require('./routes/selectors');
const functionsRoutes = require('./routes/functions');
const scenariosRoutes = require('./routes/scenarios');
const runsRoutes = require('./routes/runs');
const resultsRoutes = require('./routes/results');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test Automation API is running' });
});

// API Routes
app.use('/api/users', usersRoutes);
app.use('/api/selectors', selectorsRoutes);
app.use('/api/functions', functionsRoutes);
app.use('/api/scenarios', scenariosRoutes);
app.use('/api/runs', runsRoutes);
app.use('/api/results', resultsRoutes);
app.use('/api/settings', settingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`API Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      logger.success(`\n✓ Test Automation API running on http://localhost:${PORT}`);
      logger.log('Available endpoints:');
      logger.log(`  GET  /api/health`);
      logger.log(`  GET  /api/users`);
      logger.log(`  GET  /api/selectors`);
      logger.log(`  GET  /api/functions`);
      logger.log(`  GET  /api/scenarios`);
      logger.log(`  GET  /api/runs`);
      logger.log(`  GET  /api/results`);
      logger.log(`  GET  /api/settings`);
      logger.log(`\nMonitor logs above for execution details\n`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = app;
