const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g. "nagaraj_farm"
  displayName: { type: String, required: true },
  bio: { type: String, default: '' },
  avatarColor: { type: String, default: 'linear-gradient(135deg, #10b981, #059669)' },
  initials: { type: String, default: 'FA' },
  createdAt: { type: Date, default: Date.now }
});

// Seed some demo users if DB is empty
userSchema.statics.seedIfEmpty = async function () {
  const count = await this.countDocuments();
  if (count === 0) {
    await this.insertMany([
      { userId: 'nagaraj_farm', displayName: 'Nagaraj C', initials: 'NC', avatarColor: 'linear-gradient(135deg,#f59e0b,#d97706)', bio: 'Paddy & rice farmer from Tamil Nadu 🌾' },
      { userId: 'greenvalley_org', displayName: 'Green Valley Organics', initials: 'GV', avatarColor: 'linear-gradient(135deg,#10b981,#059669)', bio: 'Certified organic farmer 🍅' },
      { userId: 'marcus_acres', displayName: 'Marcus Thornton', initials: 'MT', avatarColor: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', bio: 'Wheat & soybean farmer ☀️' },
      { userId: 'beekeeper_lisa', displayName: 'Lisa Bee', initials: 'LB', avatarColor: 'linear-gradient(135deg,#ec4899,#be185d)', bio: 'Beekeeper & natural honey producer 🍯' },
      { userId: 'rootsandshoots', displayName: 'Roots & Shoots Farm', initials: 'RS', avatarColor: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', bio: 'Urban gardening enthusiast 🌱' },
      { userId: 'amit_kisan', displayName: 'Amit Kumar', initials: 'AK', avatarColor: 'linear-gradient(135deg,#f97316,#ea580c)', bio: 'Vegetable farmer from UP 🥕' },
      { userId: 'sarah_j', displayName: 'Sarah Johnson', initials: 'SJ', avatarColor: 'linear-gradient(135deg,#06b6d4,#0891b2)', bio: 'Herbalist & spice grower 🌿' },
      { userId: 'farm_suresh', displayName: 'Suresh Patel', initials: 'SP', avatarColor: 'linear-gradient(135deg,#84cc16,#65a30d)', bio: 'Cotton farmer Gujarat 🌾' },
    ]);
    console.log('🌱 Seeded demo users');
  }
};

module.exports = mongoose.model('User', userSchema);
