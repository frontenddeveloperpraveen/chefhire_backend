const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  chefId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' }, // Optional, can be direct hire
  status: { type: String, enum: ['Requested', 'Scheduled', 'Completed', 'Cancelled', 'Hired', 'Rejected', 'OnHold'], default: 'Requested' },
  date: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
