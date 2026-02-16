const router = require('express').Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const User = require('../models/User');

// Request Booking/Interview (Hotel initiates)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hotel') {
      return res.status(403).json({ msg: 'Only hotels can request bookings' });
    }

    const { chefId, jobId, date, notes } = req.body;

    const newBooking = new Booking({
      hotelId: req.user.id,
      chefId,
      jobId,
      date,
      notes
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get Bookings (For both Chef and Hotel)
router.get('/', auth, async (req, res) => {
  try {
    let bookings;
    if (req.user.role === 'hotel') {
      bookings = await Booking.find({ hotelId: req.user.id })
        .populate('chefId', 'name chefProfile phone')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ chefId: req.user.id })
        .populate('hotelId', 'name hotelProfile')
        .populate('jobId', 'title')
        .sort({ createdAt: -1 });
    }
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Booking Status (Chef accepts/rejects, or Hotel cancels)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Validate ownership
    if (booking.chefId.toString() !== req.user.id && booking.hotelId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();
    res.json(booking);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
