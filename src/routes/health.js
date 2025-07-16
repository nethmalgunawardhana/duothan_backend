const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.get('/', healthController.healthCheck);
router.get('/database', healthController.databaseCheck);
router.get('/services', healthController.servicesCheck);

module.exports = router;