const User = require('../models/User');

// Idempotent sync endpoint - called after frontend login
const syncAuth = async (req, res) => {
  try {
    const { uid, email } = req.user;

    // Use findOneAndUpdate with upsert option to ensure atomic operation
    // This prevents race conditions where multiple requests could create duplicate users
    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        firebaseUid: uid,
        email: email 
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'User authenticated and synced successfully',
      user: {
        id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Auth sync error:', error);
    // Handle duplicate key errors specifically
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User already exists with different credentials'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during authentication sync',
      error: error.message
    });
  }
};

module.exports = {
  syncAuth
};