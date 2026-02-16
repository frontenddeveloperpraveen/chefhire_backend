
// Update Applicant Status (Hire/Reject/Hold)
router.put('/:id/applicants/:chefId', auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: 'Job not found' });

    if (job.hotelId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.chefId.toString() === req.params.chefId);
    if (!applicant) return res.status(404).json({ msg: 'Applicant not found' });

    const { status, hiredStartDate, hiredEndDate } = req.body;

    if (status) applicant.status = status; // 'Hired', 'Rejected', 'OnHold'
    if (hiredStartDate) applicant.hiredStartDate = hiredStartDate;
    if (hiredEndDate) applicant.hiredEndDate = hiredEndDate;

    await job.save();

    // specific logic for Hired
    if (status === 'Hired') {
        const existingBooking = await Booking.findOne({ 
            chefId: req.params.chefId, 
            jobId: job._id,
            status: 'Hired'
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
