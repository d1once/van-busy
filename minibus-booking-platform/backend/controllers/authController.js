const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as necessary

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check for user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials (user not found)' });
    }

    // Check if user is an admin
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized, not an admin' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials (password mismatch)' });
    }

    // Create JWT
    const payload = {
      id: user._id,
      isAdmin: user.isAdmin,
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
            isAdmin: user.isAdmin,
          },
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error during login');
  }
};

// @desc    Register a new admin (for initial setup)
// @route   POST /api/auth/register
// @access  Public (should be restricted after setup)
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
      isAdmin: true, // Ensure this user is an admin
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Optionally: return a token directly upon registration
    const payload = {
      id: user._id,
      isAdmin: user.isAdmin,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'Admin user registered successfully. Please login.',
          user: {
            id: user._id,
            username: user.username,
            isAdmin: user.isAdmin,
          },
          // token: token // Uncomment if you want to return token on registration
        });
      }
    );
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error during registration');
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
};
