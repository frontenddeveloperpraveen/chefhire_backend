const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [{ type: String }],
  salaryMin: { type: Number },
  salaryMax: { type: Number },
  location: { type: String, required: true },
  cuisineType: [{ type: String }],
  experienceRequired: { type: Number, default: 0 },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applicants: [{
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    coverLetter: String,
    whatsappNumber: String,
    expectedPrice: Number,
    hiredStartDate: Date,
    hiredEndDate: Date,
    status: { type: String, enum: ['Applied', 'Interviewing', 'Shortlisted', 'Hired', 'Rejected', 'OnHold'], default: 'Applied' },
    appliedAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
