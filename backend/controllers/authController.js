const User = require('../models/User');
const Collector = require('../models/Collector');
const Vendor = require('../models/Vendor');
const Admin = require('../models/Admin');
const { generateToken } = require('../config/jwt');
const { generateUserQRCode } = require('../utils/helpers');

// @desc    Register a new user
// @route   POST /api/auth/register/user
// @access  Public
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address
    });

    // Generate QR code for user
    const qrCode = await generateUserQRCode(user._id);
    user.qrCode = qrCode;
    await user.save();

    // Generate token
    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        points: user.points,
        qrCode: user.qrCode,
        role: 'user'
      },
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user/collector/vendor/admin
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    // Find user based on role
    let user;
    let Model;
    
    switch (role) {
      case 'user':
        Model = User;
        break;
      case 'collector':
        Model = Collector;
        break;
      case 'vendor':
        Model = Vendor;
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
    }

    user = await Model.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact administrator'
      });
    }

    // Generate token
    const token = generateToken(user._id, role);

    // Prepare response data
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: role
    };

    // Add role-specific data
    if (role === 'user') {
      userData.points = user.points;
      userData.qrCode = user.qrCode;
      userData.totalWasteDisposed = user.totalWasteDisposed;
    } else if (role === 'collector') {
      userData.totalWasteCollected = user.totalWasteCollected;
      userData.acceptedWasteTypes = user.acceptedWasteTypes;
      userData.isVerified = user.isVerified;
    } else if (role === 'vendor') {
      userData.totalRewards = user.totalRewards;
      userData.totalRedemptions = user.totalRedemptions;
      userData.isVerified = user.isVerified;
    } else if (role === 'admin') {
      userData.permissions = user.permissions;
    }

    res.status(200).json({
      success: true,
      data: userData,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    let Model;
    switch (req.userRole) {
      case 'user':
        Model = User;
        break;
      case 'collector':
        Model = Collector;
        break;
      case 'vendor':
        Model = Vendor;
        break;
      case 'admin':
        Model = Admin;
        break;
    }

    const user = await Model.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    let Model;
    switch (req.userRole) {
      case 'user':
        Model = User;
        break;
      case 'collector':
        Model = Collector;
        break;
      case 'vendor':
        Model = Vendor;
        break;
      case 'admin':
        Model = Admin;
        break;
    }

    const user = await Model.findById(req.user._id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Set new password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
