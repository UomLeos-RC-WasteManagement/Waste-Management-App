const Vendor = require('../models/Vendor');
const Reward = require('../models/Reward');
const RewardRedemption = require('../models/RewardRedemption');

// @desc    Get vendor dashboard
// @route   GET /api/vendors/dashboard
// @access  Private (Vendor)
exports.getDashboard = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user._id);

    // Get active rewards count
    const now = new Date();
    const activeRewards = await Reward.countDocuments({
      vendor: req.user._id,
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    });

    // Get this month's redemptions
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthRedemptions = await RewardRedemption.find({
      vendor: req.user._id,
      createdAt: { $gte: startOfMonth }
    });

    const monthlyRedemptionsCount = monthRedemptions.length;
    const monthlyPointsDistributed = monthRedemptions.reduce(
      (sum, r) => sum + r.pointsUsed, 
      0
    );

    // Get unique users this month
    const uniqueUsersThisMonth = new Set(
      monthRedemptions.map(r => r.user.toString())
    ).size;

    res.status(200).json({
      success: true,
      data: {
        vendor: {
          name: vendor.name,
          logo: vendor.logo,
          totalRewards: vendor.totalRewards,
          totalRedemptions: vendor.totalRedemptions,
          uniqueUsers: vendor.uniqueUsers
        },
        activeRewards,
        thisMonth: {
          redemptions: monthlyRedemptionsCount,
          pointsDistributed: monthlyPointsDistributed,
          uniqueUsers: uniqueUsersThisMonth
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create a new reward
// @route   POST /api/vendors/rewards
// @access  Private (Vendor)
exports.createReward = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      pointsRequired,
      discountPercentage,
      discountAmount,
      stockAvailable,
      validFrom,
      validUntil,
      termsAndConditions,
      category
    } = req.body;

    const reward = await Reward.create({
      vendor: req.user._id,
      title,
      description,
      type,
      pointsRequired,
      discountPercentage,
      discountAmount,
      stockAvailable,
      validFrom: validFrom || Date.now(),
      validUntil,
      termsAndConditions,
      category
    });

    // Update vendor's total rewards count
    req.user.totalRewards += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all vendor's rewards
// @route   GET /api/vendors/rewards
// @access  Private (Vendor)
exports.getMyRewards = async (req, res) => {
  try {
    const { status = 'all' } = req.query;

    const query = { vendor: req.user._id };

    if (status === 'active') {
      const now = new Date();
      query.isActive = true;
      query.validFrom = { $lte: now };
      query.validUntil = { $gte: now };
    } else if (status === 'expired') {
      query.validUntil = { $lt: new Date() };
    } else if (status === 'upcoming') {
      query.validFrom = { $gt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const rewards = await Reward.find(query).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: rewards.length,
      data: rewards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update a reward
// @route   PUT /api/vendors/rewards/:id
// @access  Private (Vendor)
exports.updateReward = async (req, res) => {
  try {
    let reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Make sure vendor owns the reward
    if (reward.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this reward'
      });
    }

    reward = await Reward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: reward
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a reward
// @route   DELETE /api/vendors/rewards/:id
// @access  Private (Vendor)
exports.deleteReward = async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Make sure vendor owns the reward
    if (reward.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this reward'
      });
    }

    // Soft delete - just deactivate
    reward.isActive = false;
    await reward.save();

    res.status(200).json({
      success: true,
      message: 'Reward deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get redemptions for vendor's rewards
// @route   GET /api/vendors/redemptions
// @access  Private (Vendor)
exports.getRedemptions = async (req, res) => {
  try {
    const { status, startDate, endDate, rewardId } = req.query;

    const query = { vendor: req.user._id };

    if (status) {
      query.status = status;
    }

    if (rewardId) {
      query.reward = rewardId;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const redemptions = await RewardRedemption.find(query)
      .populate('user', 'name email phone')
      .populate('reward', 'title type pointsRequired')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: redemptions.length,
      data: redemptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify and use a redemption code
// @route   POST /api/vendors/redemptions/:code/verify
// @access  Private (Vendor)
exports.verifyRedemption = async (req, res) => {
  try {
    const redemption = await RewardRedemption.findOne({
      redemptionCode: req.params.code,
      vendor: req.user._id
    })
      .populate('user', 'name email phone')
      .populate('reward', 'title description type');

    if (!redemption) {
      return res.status(404).json({
        success: false,
        message: 'Redemption code not found'
      });
    }

    if (redemption.status === 'used') {
      return res.status(400).json({
        success: false,
        message: 'This code has already been used',
        usedAt: redemption.usedAt
      });
    }

    if (redemption.status === 'expired') {
      return res.status(400).json({
        success: false,
        message: 'This code has expired'
      });
    }

    if (new Date() > redemption.expiresAt) {
      redemption.status = 'expired';
      await redemption.save();
      
      return res.status(400).json({
        success: false,
        message: 'This code has expired'
      });
    }

    // Mark as used
    redemption.status = 'used';
    redemption.usedAt = new Date();
    await redemption.save();

    res.status(200).json({
      success: true,
      message: 'Redemption verified successfully',
      data: redemption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get vendor analytics/reports
// @route   GET /api/vendors/analytics
// @access  Private (Vendor)
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let startDate;
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    const redemptions = await RewardRedemption.find({
      vendor: req.user._id,
      createdAt: { $gte: startDate }
    }).populate('reward', 'title type pointsRequired');

    // Analytics calculations
    const totalRedemptions = redemptions.length;
    const totalPointsDistributed = redemptions.reduce(
      (sum, r) => sum + r.pointsUsed,
      0
    );
    const uniqueUsers = new Set(redemptions.map(r => r.user.toString())).size;

    // Redemptions by reward
    const byReward = {};
    redemptions.forEach(r => {
      const rewardId = r.reward._id.toString();
      if (!byReward[rewardId]) {
        byReward[rewardId] = {
          reward: r.reward,
          count: 0,
          pointsUsed: 0
        };
      }
      byReward[rewardId].count += 1;
      byReward[rewardId].pointsUsed += r.pointsUsed;
    });

    // Daily breakdown
    const dailyStats = {};
    redemptions.forEach(r => {
      const date = r.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          redemptions: 0,
          points: 0,
          users: new Set()
        };
      }
      dailyStats[date].redemptions += 1;
      dailyStats[date].points += r.pointsUsed;
      dailyStats[date].users.add(r.user.toString());
    });

    // Convert sets to counts
    const dailyStatsArray = Object.values(dailyStats).map(day => ({
      date: day.date,
      redemptions: day.redemptions,
      points: day.points,
      uniqueUsers: day.users.size
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.status(200).json({
      success: true,
      data: {
        period,
        summary: {
          totalRedemptions,
          totalPointsDistributed,
          uniqueUsers,
          averagePointsPerRedemption: totalRedemptions > 0 
            ? Math.round(totalPointsDistributed / totalRedemptions) 
            : 0
        },
        byReward: Object.values(byReward),
        dailyStats: dailyStatsArray
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update vendor profile
// @route   PUT /api/vendors/profile
// @access  Private (Vendor)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, description, businessType, address, website } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user._id,
      { name, phone, description, businessType, address, website },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
