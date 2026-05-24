const User = require('../models/User');

const { ROLES } = User;
const generateToken = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and role',
        data: null,
      });
    }

    if (!ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be Admin or BDA',
        data: null,
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
        data: null,
      });
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({
        success: false,
        message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      data: null,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        data: null,
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        data: null,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      data: null,
    });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'User profile fetched',
    data: {
      user: req.user.toSafeObject(),
    },
  });
};

module.exports = { register, login, getMe };
