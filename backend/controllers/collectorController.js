const Collector = require('../models/Collector');
const User = require('../models/User');
const WasteTransaction = require('../models/WasteTransaction');
const Badge = require('../models/Badge');
const { calculatePoints, checkBadgeEligibility } = require('../utils/helpers');

// @desc    Get collector dashboard
// @route   GET /api/collectors/dashboard
// @access  Private (Collector)
exports.getDashboard = async (req, res) => {
  try {
    const collector = await Collector.findById(req.user._id);

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await WasteTransaction.find({
      collector: req.user._id,
      createdAt: { $gte: today },
      status: 'verified'
    });

    const todayWaste = todayTransactions.reduce((sum, t) => sum + t.quantity.value, 0);

    // Get this month's stats
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthTransactions = await WasteTransaction.find({
      collector: req.user._id,
      createdAt: { $gte: startOfMonth },
      status: 'verified'
    });

    const monthWaste = monthTransactions.reduce((sum, t) => sum + t.quantity.value, 0);

    // Waste breakdown
    const wasteBreakdown = {};
    monthTransactions.forEach(t => {
      wasteBreakdown[t.wasteType] = (wasteBreakdown[t.wasteType] || 0) + t.quantity.value;
    });

    res.status(200).json({
      success: true,
      data: {
        collector: {
          name: collector.name,
          totalWasteCollected: collector.totalWasteCollected,
          totalTransactions: collector.totalTransactions,
          acceptedWasteTypes: collector.acceptedWasteTypes
        },
        today: {
          transactions: todayTransactions.length,
          wasteCollected: todayWaste
        },
        thisMonth: {
          transactions: monthTransactions.length,
          wasteCollected: monthWaste,
          wasteBreakdown
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

// @desc    Verify waste drop-off (QR scan)
// @route   POST /api/collectors/verify-dropoff
// @access  Private (Collector)
exports.verifyDropoff = async (req, res) => {
  try {
    const { userId, wasteType, quantity, unit, qrCodeScanned, notes } = req.body;

    // Validate inputs
    if (!userId || !wasteType || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId, wasteType, and quantity'
      });
    }

    // Check if collector accepts this waste type
    if (!req.user.acceptedWasteTypes.includes(wasteType)) {
      return res.status(400).json({
        success: false,
        message: `This collection point does not accept ${wasteType}`
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate points
    const pointsEarned = calculatePoints(wasteType, quantity);

    // Create waste transaction
    const transaction = await WasteTransaction.create({
      user: userId,
      collector: req.user._id,
      wasteType,
      quantity: {
        value: quantity,
        unit: unit || 'kg'
      },
      pointsEarned,
      status: 'verified',
      qrCodeScanned: qrCodeScanned || false,
      notes,
      verifiedAt: new Date(),
      location: {
        type: 'Point',
        coordinates: req.user.location.coordinates
      }
    });

    // Update user stats
    user.points += pointsEarned;
    user.totalWasteDisposed += quantity;

    // Check for badge eligibility
    const allBadges = await Badge.find({ isActive: true });
    const newBadges = await checkBadgeEligibility(user, allBadges);
    
    if (newBadges.length > 0) {
      user.badges.push(...newBadges);
      // Award bonus points for badges
      newBadges.forEach(badgeId => {
        const badge = allBadges.find(b => b._id.toString() === badgeId.toString());
        if (badge && badge.points) {
          user.points += badge.points;
        }
      });
    }

    await user.save();

    // Update collector stats
    req.user.totalWasteCollected += quantity;
    req.user.totalTransactions += 1;
    await req.user.save();

    // Populate the transaction for response
    await transaction.populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: {
        transaction,
        newBadges: newBadges.length > 0 ? newBadges : null
      },
      message: `Successfully verified drop-off. User earned ${pointsEarned} points!`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get collector's transactions
// @route   GET /api/collectors/transactions
// @access  Private (Collector)
exports.getTransactions = async (req, res) => {
  try {
    const { status, startDate, endDate, wasteType } = req.query;

    const query = { collector: req.user._id };

    if (status) {
      query.status = status;
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

    if (wasteType) {
      query.wasteType = wasteType;
    }

    const transactions = await WasteTransaction.find(query)
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get collection reports
// @route   GET /api/collectors/reports
// @access  Private (Collector)
exports.getReports = async (req, res) => {
  try {
    const { period = 'month', year, month } = req.query;

    let startDate, endDate;

    if (period === 'day') {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    } else if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
    } else if (period === 'month') {
      if (year && month) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59, 999);
      } else {
        startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
      }
    } else if (period === 'year') {
      const currentYear = year || new Date().getFullYear();
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    const transactions = await WasteTransaction.find({
      collector: req.user._id,
      status: 'verified',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate statistics
    const totalTransactions = transactions.length;
    const totalWaste = transactions.reduce((sum, t) => sum + t.quantity.value, 0);
    const totalPoints = transactions.reduce((sum, t) => sum + t.pointsEarned, 0);

    // Waste breakdown by type
    const wasteByType = {};
    transactions.forEach(t => {
      if (!wasteByType[t.wasteType]) {
        wasteByType[t.wasteType] = {
          quantity: 0,
          transactions: 0,
          points: 0
        };
      }
      wasteByType[t.wasteType].quantity += t.quantity.value;
      wasteByType[t.wasteType].transactions += 1;
      wasteByType[t.wasteType].points += t.pointsEarned;
    });

    // Daily breakdown (for charts)
    const dailyStats = {};
    transactions.forEach(t => {
      const date = t.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          quantity: 0,
          transactions: 0,
          points: 0
        };
      }
      dailyStats[date].quantity += t.quantity.value;
      dailyStats[date].transactions += 1;
      dailyStats[date].points += t.pointsEarned;
    });

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate,
        summary: {
          totalTransactions,
          totalWaste,
          totalPoints,
          uniqueUsers: new Set(transactions.map(t => t.user.toString())).size
        },
        wasteByType,
        dailyStats: Object.values(dailyStats).sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        )
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update collector profile
// @route   PUT /api/collectors/profile
// @access  Private (Collector)
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, operatingHours, description } = req.body;

    const collector = await Collector.findByIdAndUpdate(
      req.user._id,
      { name, phone, address, operatingHours, description },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: collector
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
