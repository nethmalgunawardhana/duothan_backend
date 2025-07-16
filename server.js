const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Import routes from src folder
const authRoutes = require('./src/routes/auth');
const healthRoutes = require('./src/routes/health');
const adminRoutes = require('./src/routes/admin');
const submissionRoutes = require('./src/routes/submission');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration Options - Choose one based on your needs:

// OPTION 1: COMPETITION MODE - Allow all origins (use this for competition)
app.use(cors({
  origin: true, // Allows any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// OPTION 2: DEVELOPMENT MODE - Multiple specific origins
// app.use(cors({
//   origin: [
//     'http://localhost:3000',
//     'http://localhost:3001', 
//     'http://127.0.0.1:3000',
//     process.env.FRONTEND_URL
//   ].filter(Boolean),
//   credentials: true
// }));

// OPTION 3: PRODUCTION MODE - Single specific origin (use after competition)
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));

// Other middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/submissions', submissionRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🌐 Backend URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});