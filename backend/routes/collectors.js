const express = require('express');
const router = express.Router();
const {
  getDashboard,
  verifyDropoff,
  getTransactions,
  getReports,
  updateProfile
} = require('../controllers/collectorController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only for collectors
router.use(protect);
router.use(authorize('collector'));

router.get('/dashboard', getDashboard);
router.post('/verify-dropoff', verifyDropoff);
router.get('/transactions', getTransactions);
router.get('/reports', getReports);
router.put('/profile', updateProfile);

module.exports = router;
