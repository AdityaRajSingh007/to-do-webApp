const User = require('../models/User');

// Idempotent sync endpoint - called after frontend login
const syncAuth = async (req, res) => {
  try {
    const { uid, email } = req.user;

    // Find or create user in MongoDB based on Firebase UID
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