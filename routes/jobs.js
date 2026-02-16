const router = require('express').Router();
const Job = require('../models/Job');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST Job (Hotel Only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'hotel') {
      return res.status(403).json({ msg: 'Only hotels can post jobs' });
    }

    const { title, description, requirements, salaryMin, salaryMax, location, cuisineType, experienceRequired } = req.body;

    const newJob = new Job({
      hotelId: req.user.id,
      title,
      description,
      requirements,
      salaryMin,
      salaryMax,
      location,
      cuisineType,
      experienceRequired
    });

    const job = await newJob.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET Jobs (Public/Chef see all open, Hotel sees theirs)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role === 'hotel') {
      const jobs = await Job.find({ hotelId: req.user.id })
        .populate('applicants.chefId', 'name email phone profilePic chefProfile')
        .sort({ createdAt: -1 });
      return res.json(jobs);
    }
    
    // For Chefs/Public
    // Filters could be added here similar to Chef Search
    const jobs = await Job.find({ status: 'Open' }).populate('hotelId', 'name hotelProfile').sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET Jobs Applied by Chef
router.get('/applied', auth, async (req, res) => {
  try {
    if (req.user.role !== 'chef') return res.status(403).json({ msg: 'Not authorized' });

    const jobs = await Job.find({ 'applicants.chefId': req.user.id })
      .populate('hotelId', 'name profilePic')
      .select('title status applicants hotelId location salaryMin salaryMax createdAt');
      
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// APPLY to Job
router.post('/:id/apply', auth, async (req, res) => {
  try {
    if (req.user.role !== 'chef') {
      return res.status(403).json({ msg: 'Only chefs can apply' });
    }
    
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    const { coverLetter, whatsappNumber, expectedPrice } = req.body;

    // Check if already applied
    if (job.applicants.find(a => a.chefId.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Already applied' });
    }

    job.applicants.unshift({ 
      chefId: req.user.id,
      coverLetter,
      whatsappNumber,
      expectedPrice
    });
    await job.save();

    res.json(job.applicants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Status
router.put('/:id/applicants/:chefId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    if (job.hotelId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.chefId.toString() === req.params.chefId);
    if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

    const { status, hiredStartDate, hiredEndDate } = req.body;

    if (status) applicant.status = status;
    if (hiredStartDate) applicant.hiredStartDate = hiredStartDate;
    if (hiredEndDate) applicant.hiredEndDate = hiredEndDate;

    await job.save();

    if (status === 'Hired') {
       const existingBooking = await Booking.findOne({ 
          chefId: req.params.chefId, 
          jobId: job._id 
       });
       
       if (!existingBooking) {
           const newBooking = new Booking({
              chefId: req.params.chefId,
              hotelId: req.user.id,
              jobId: job._id,
              status: 'Hired',
              date: hiredStartDate || Date.now(),
              notes: `Hired for ${job.title}. Period: ${new Date(hiredStartDate).toLocaleDateString()} - ${new Date(hiredEndDate).toLocaleDateString()}`
           });
           await newBooking.save();
       }
    }

    res.json(job.applicants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
