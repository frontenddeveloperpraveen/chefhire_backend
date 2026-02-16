const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, phone, hotelName, bio } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user object based on role
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      name,
      phone,
      // Optional fields depending on role, simplistic logic for now
      chefProfile: role === 'chef' ? { bio } : undefined,
      hotelProfile: role === 'hotel' ? { hotelName } : undefined
    });

    await newUser.save();
    
    // Create JWT Payload
    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: 360000 }, (err, token) => {
      if(err) throw err;
      res.json({ token, user: { id: newUser.id, role: newUser.role, name: newUser.name } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET || 'secretKey', { expiresIn: 360000 }, (err, token) => {
      if(err) throw err;
      res.json({ token, user: { id: user.id, role: user.role, name: user.name, chefProfile: user.chefProfile, hotelProfile: user.hotelProfile } });
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
