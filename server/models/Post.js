const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: String, default: 'Anonymous' },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: String, default: 'Anonymous' },
  authorInitials: { type: String, default: 'AN' },
  authorColor: { type: String, default: 'linear-gradient(135deg, #10b981, #059669)' },
  content: { type: String, required: true },
  imageUrl: { type: String, default: null },
  likes: [{ type: String }], // array of user identifiers who liked
  taggedUsers: [{ type: String }], // @mentioned userIds
  comments: [commentSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
