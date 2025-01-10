const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    image: String,
    comment: String,
    createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
