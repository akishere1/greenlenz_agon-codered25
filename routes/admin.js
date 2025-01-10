const express = require('express');
const router = express.Router();
const Post = require('../models/post'); // Post Schema
const User = require('../models/user'); // User Schema

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Fetch all posts
        const users = await User.find(); // Fetch all users

        res.render('admin', { posts, users });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Failed to load admin dashboard.');
    }
});

module.exports = router;

