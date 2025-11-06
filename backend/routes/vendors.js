const express = require('express');
const router = express.Router();
const {
  getDashboard,
  createReward,
  getMyRewards,
  updateReward,
  deleteReward,
  getRedemptions,
  verifyRedemption,
  getAnalytics,
  updateProfile
} = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only for vendors
router.use(protect);
router.use(authorize('vendor'));

router.get('/dashboard', getDashboard);
router.post('/rewards', createReward);
router.get('/rewards', getMyRewards);
router.put('/rewards/:id', updateReward);
router.delete('/rewards/:id', deleteReward);
router.get('/redemptions', getRedemptions);
router.post('/redemptions/:code/verify', verifyRedemption);
router.get('/analytics', getAnalytics);
router.put('/profile', updateProfile);

module.exports = router;
