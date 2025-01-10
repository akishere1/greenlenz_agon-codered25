const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Post = require('./models/post'); // Post model for MongoDB
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/', // Directory to store files
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`; // Add timestamp to avoid name conflicts
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });
//
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.get('/', (req, res) => {
    res.render('index'); // Ensure "index.ejs" is in the "views" folder
});
app.get('/admin', (req, res) => {
    res.render('admin.') // Ensure "index.ejs" is in the "views" folder
});
// 1. Upload Route
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        const { description, time } = req.body; // Get description and time from request body
        const photo = req.file; // Uploaded file

        // Validation
        if (!photo || !description || !time) {
            return res.status(400).json({ error: 'Photo, description, and time are required.' });
        }

        // Save to MongoDB
        const newPost = new Post({
            image: `/uploads/${photo.filename}`, // File path
            comment: description, // Description
            createdAt: new Date(time), // Timestamp
        });

        const savedPost = await newPost.save();

        res.status(201).json({
            message: 'Photo uploaded successfully!',
            post: savedPost,
        });
    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo' });
    }
});

// 2. Get All Posts
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Fetch all posts, sorted by newest first
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// 3. Get Single Post by ID
app.get('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// 4. Update Post
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description } = req.body;

        // Validate input
        if (!description) {
            return res.status(400).json({ error: 'Description is required.' });
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            { comment: description },
            { new: true, runValidators: true }
        );

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({
            message: 'Post updated successfully!',
            post: updatedPost,
        });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// 5. Delete Post
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.status(200).json({
            message: 'Post deleted successfully!',
            post: deletedPost,
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


