const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  });
  const refreshToken = jwt.sign({ userId }, config.jwtRefreshSecret, {
    expiresIn: config.jwtRefreshExpiry,
  });
  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Registration successful.',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error.message, error.stack); // Added detailed error logging
    res.status(500).json({ message: 'Server error during registration.', error: error.message }); // Return error message in response
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Login successful.',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('+refreshToken');
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during logout.' });
  }
};
