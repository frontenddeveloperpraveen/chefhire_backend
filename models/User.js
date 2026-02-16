const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['chef', 'hotel', 'admin'], required: true },
  name: { type: String, required: true }, // Chef Name or Hotel Manager Name
  phone: { type: String },
  profilePic: { type: String }, // Profile picture for both
  createdAt: { type: Date, default: Date.now },
  isAdmin: { type: Boolean, default: false },

  // Chef Specific Fields
  chefProfile: {
    bio: { type: String },
    specialties: [{ type: String }], // e.g. ["Italian", "Tandoor"]
    experienceYears: { type: Number },
    salaryExpectation: { type: Number }, // e.g. Monthly salary
    isVerified: { type: Boolean, default: false },
    age: { type: Number },
    location: { type: String }, // Can be city/area
    availabilityStatus: { type: String, enum: ['Available', 'Busy'], default: 'Available' },
    resumeUrl: { type: String },
    portfolio: [{ type: String }], // Array of image URLs
    skills: [{ type: String }],
    gallery: [{ type: String }], // Additional photos
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },

  // Hotel Specific Fields
  hotelProfile: {
    hotelName: { type: String },
    address: { type: String },
    website: { type: String },
    logoUrl: { type: String },
    savedChefs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
