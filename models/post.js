const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    image: { type: String, required: true }, // File path or URL
    comment: { type: String, required: true }, // Description
    createdAt: { type: Date, default: Date.now }, // Timestamp
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
