const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test-automation-tool';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    throw error;
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('✗ MongoDB disconnection failed:', error.message);
  }
};

module.exports = { connectDB, disconnectDB };
