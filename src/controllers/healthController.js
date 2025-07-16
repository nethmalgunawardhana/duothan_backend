const { testFirebaseConnection } = require('../config/firebase');
const { testSendGridConnection } = require('../config/sendgrid');
const { testImageKitConnection } = require('../config/imagekit');
const { testJudge0Connection } = require('../config/judge0');

const healthCheck = async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {}
  };

  try {
    // Test Firebase
    health.services.firebase = await testFirebaseConnection();
    
    // Test SendGrid (commented out to avoid sending test emails repeatedly)
    // health.services.sendgrid = await testSendGridConnection();
    health.services.sendgrid = !!process.env.SENDGRID_API_KEY;
    
    // Test ImageKit
    health.services.imagekit = await testImageKitConnection();
    
    // Test Judge0
    health.services.judge0 = await testJudge0Connection();
    
    const allServicesHealthy = Object.values(health.services).every(status => status === true);
    
    if (!allServicesHealthy) {
      health.status = 'DEGRADED';
    }

    res.status(allServicesHealthy ? 200 : 503).json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};

const databaseCheck = async (req, res) => {
  try {
    const isConnected = await testFirebaseConnection();
    res.json({
      success: true,
      database: {
        status: isConnected ? 'connected' : 'disconnected',
        type: 'Firebase Firestore'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database check failed',
      error: error.message
    });
  }
};

const servicesCheck = async (req, res) => {
  try {
    const services = {
      firebase: await testFirebaseConnection(),
      imagekit: await testImageKitConnection(),
      sendgrid: !!process.env.SENDGRID_API_KEY,
      judge0: await testJudge0Connection()
    };

    res.json({
      success: true,
      services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Services check failed',
      error: error.message
    });
  }
};

module.exports = {
  healthCheck,
  databaseCheck,
  servicesCheck
};