const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const Review = require('./models/Review');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/chefapp');
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Review.deleteMany({});

    // Create Password Hash
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    // Create Chefs
    const chef1 = new User({
      email: 'chef1@example.com',
      password,
      role: 'chef',
      name: 'Chef Amit Kumar',
      phone: '9876543210',
      chefProfile: {
        bio: 'Expert in North Indian and Tandoor cuisines with 10 years experience.',
        specialties: ['North Indian', 'Tandoor', 'Mughlai'],
        experienceYears: 10,
        salaryExpectation: 50000,
        isVerified: true,
        age: 32,
        location: 'Delhi',
        availabilityStatus: 'Available',
        skills: ['Curry', 'Kebabs', 'Bread Making'],
        rating: 4.8,
        reviewCount: 15
      }
    });

    const chef2 = new User({
      email: 'chef2@example.com',
      password,
      role: 'chef',
      name: 'Chef Sarah Jones',
      phone: '1234567890',
      chefProfile: {
        bio: 'Passionate about Italian and Continental cuisines. Worked in 5-star hotels.',
        specialties: ['Italian', 'Continental', 'Bakery'],
        experienceYears: 5,
        salaryExpectation: 60000,
        isVerified: false, // Not verified
        age: 28,
        location: 'Mumbai',
        availabilityStatus: 'Available',
        skills: ['Pasta', 'Pizza', 'Pastry'],
        rating: 4.2,
        reviewCount: 8
      }
    });

    // Create Hotel
    const hotel1 = new User({
      email: 'hotel1@example.com',
      password,
      role: 'hotel',
      name: 'Grand Royal Hotel',
      phone: '1122334455',
      hotelProfile: {
        hotelName: 'Grand Royal Hotel',
        address: 'Connaught Place, Delhi',
        website: 'www.grandroyal.com'
      }
    });

    await chef1.save();
    await chef2.save();
    await hotel1.save();

    // Create Job
    const job1 = new Job({
      hotelId: hotel1._id,
      title: 'Head Chef needed for Indian Cuisine',
      description: 'Looking for experienced Head Chef specialized in North Indian curry and tandoor.',
      requirements: ['10+ years experience', 'Team management', 'Menu planning'],
      salaryMin: 45000,
      salaryMax: 60000,
      location: 'Delhi',
      cuisineType: ['North Indian'],
      experienceRequired: 8
    });

    await job1.save();

    // Create Review
    const review1 = new Review({
        reviewerId: hotel1._id,
        targetId: chef1._id,
        rating: 5,
        comment: 'Excellent skills and very professional.'
    });
    
    await review1.save();

    console.log('Data Seeded Successfully');
    process.exit();

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedData();
