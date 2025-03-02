const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('../shared/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Auth Service is running');
});

// Start server
const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync();
    
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start Auth Service:', error);
  }
};

startServer(); 