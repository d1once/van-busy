const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as necessary

// @desc    Login user or admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => { // Renamed from loginAdmin
  const { username, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }

    // Password check is generic, role check removed from here
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
    }

    // Create JWT
    const payload = {
      id: user._id,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }, // Token expires in 1 day
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
          },
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error during login');
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { username, password } = req.body; // Explicitly ignore role from req.body

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user with 'user' role
    user = new User({
      username,
      password,
      role: 'user', // Always set role to 'user'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Respond with success message (no token on registration for users)
    res.status(201).json({
      message: 'User registered successfully. Please login.',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error during user registration');
  }
};

// @desc    Register a new admin (for initial setup or by another admin)
// @route   POST /api/auth/register-admin
// @access  Restricted (e.g., to already authenticated admins)
const registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new admin user
    user = new User({
      username,
      password,
      role: 'admin', // Explicitly set role to 'admin'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Optionally: return a token directly upon registration
    const payload = {
      id: user._id,
      role: user.role,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'Admin user registered successfully.',
          user: {
            id: user._id,
            username: user.username,
            role: user.role,
          },
           token: token // Return token for admin registration
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error during admin registration');
  }
};

module.exports = {
  login, // Export generalized login
  registerUser,
  registerAdmin,
};
