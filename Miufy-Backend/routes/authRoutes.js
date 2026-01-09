const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  try {
    const { username, displayUsername, password } = req.body;

    if (!username || !displayUsername || !password) {
      return res.status(400).json({ msg: "Lahat ng fields ay kailangan." });
    }

    if (!username.includes('@')) {
      return res.status(400).json({ msg: "Maling email format." });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: "Email already taken." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ 
      username, 
      displayUsername, 
      password: hashedPassword 
    });
    
    await user.save();

    const token = jwt.sign({ id: user._id }, 'secretkey');
    res.status(201).json({ 
      token, 
      userId: user._id, 
      displayUsername: user.displayUsername 
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    const token = jwt.sign({ id: user._id }, 'secretkey');
    res.json({ 
      token, 
      userId: user._id, 
      displayUsername: user.displayUsername 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;