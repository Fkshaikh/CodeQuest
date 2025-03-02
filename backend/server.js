const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./shared/db');

// Import routes from services
const authRoutes = require('./auth-service/routes/authRoutes');
const problemRoutes = require('./problem-service/routes/problemRoutes');
const submissionRoutes = require('./submission-service/routes/submissionRoutes');
const executionRoutes = require('./execution-service/routes/executionRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 6565;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/execute', executionRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Coding Platform API is running');
});

// Start server
const startServer = async () => {
  try {
    await testConnection();
    await sequelize.sync({force:false,alter:true});
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer(); 