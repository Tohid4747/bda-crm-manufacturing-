const User = require('../models/User');

const getBdaUsers = async (req, res) => {
  try {
    const bdas = await User.find({ role: 'BDA' })
      .select('name email')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: 'BDA users fetched successfully',
      data: {
        users: bdas.map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching BDA users',
      data: null,
    });
  }
};

module.exports = { getBdaUsers };
