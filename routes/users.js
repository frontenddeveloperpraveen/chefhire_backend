const router = require('express').Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get Current User Profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Profile
router.put('/me', auth, async (req, res) => {
  const { name, phone, bio, specialties, experienceYears, salaryExpectation, location, availabilityStatus, resumeUrl, portfolio, skillsService, hotelProfile } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    user.name = name || user.name;
    user.phone = phone || user.phone;

    if (user.role === 'chef') {
      if (bio) user.chefProfile.bio = bio;
      if (specialties) user.chefProfile.specialties = specialties;
      if (experienceYears) user.chefProfile.experienceYears = experienceYears;
      if (salaryExpectation) user.chefProfile.salaryExpectation = salaryExpectation;
      if (location) user.chefProfile.location = location;
      if (availabilityStatus) user.chefProfile.availabilityStatus = availabilityStatus;
      if (resumeUrl) user.chefProfile.resumeUrl = resumeUrl;
      // ... manage arrays carefully (replace or push? usually user sends whole array for simplicity)
    }

    if (user.role === 'hotel') {
        if (hotelProfile) user.hotelProfile = { ...user.hotelProfile, ...hotelProfile };
    }

    await user.save();
    res.json(user);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Search Chefs (Public or Hotel Only? Let's say authenticated user)
router.get('/chefs', auth, async (req, res) => {
    try {
        const { cuisine, experienceMin, salaryMax, location, availability, verified, search } = req.query;
        console.log({ cuisine, experienceMin, salaryMax, location, availability, verified, search })
        let query = { role: 'chef' }; 
        console.log(1)

        if (search) {
             query.$or = [
                 { name: { $regex: search, $options: 'i' } },
                 { 'chefProfile.specialties': { $in: [new RegExp(search, "i")] } }, // Match if any specialty matches regex
                 // adjust schema if needed, usually exact match for specialties is better but regex allows partial "Ind" -> "Indian"
                 { 'chefProfile.specialties': { $regex: search, $options: 'i' } } 
             ];
             console.log(2)
             // Simple regex on array of strings works in mongo
        }

        if (cuisine) {
            query['chefProfile.specialties'] = { $in: cuisine.split(',').map(c => new RegExp(c.trim(), 'i')) };
        }
        if (experienceMin) {
            query['chefProfile.experienceYears'] = { $gte: experienceMin };
        }
        if (salaryMax) {
            query['chefProfile.salaryExpectation'] = { $lte: salaryMax };
        }
        if (location) {
            query['chefProfile.location'] = { $regex: location, $options: 'i' };
        }
        if (availability) {
            query['chefProfile.availabilityStatus'] = availability;
        }
        if (verified === 'true') {
            query['chefProfile.isVerified'] = true;
        }
        const chefs = await User.find(query).select('-password');
        res.json(chefs);
        console.log("chef",chefs)

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Post Review
router.post('/:id/review', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) return res.status(404).json({ msg: 'User not found' });
        if (targetUser.role !== 'chef') return res.status(400).json({ msg: 'Can only review chefs' });

        const newReview = new Review({
            reviewerId: req.user.id,
            targetId: req.params.id,
            rating,
            comment
        });

        await newReview.save();

        // Update User Rating
        const reviews = await Review.find({ targetId: req.params.id });
        const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

        targetUser.chefProfile.rating = avgRating;
        targetUser.chefProfile.reviewCount = reviews.length;
        await targetUser.save();

        res.json(newReview);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
