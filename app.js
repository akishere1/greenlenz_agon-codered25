const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Post = require('./models/post'); // Post model for MongoDB
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const client = new ImageAnnotatorClient();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// MongoDB Connection
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index'); // Ensure "index.ejs" is in the "views" folder
});

app.get('/admin', (req, res) => {
    res.render('admin'); // Ensure "admin.ejs" is in the "views" folder
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
// Assuming you're using Express
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Get posts from MongoDB
        res.json(posts); // Respond with the posts data as JSON
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Failed to fetch posts' });
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
//
// Assuming you're using Express and the Post model
app.delete('/api/posts/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        // Delete the post from the database
        const deletedPost = await Post.findByIdAndDelete(postId);

        if (deletedPost) {
            res.status(200).json({ message: 'Report resolved and deleted' });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
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

// 6. Analyze Photo with Vision AI (No user ID required)
app.get('/api/analyze/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        // Fetch post from MongoDB
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Read the image file from the server
        const imagePath = path.join(__dirname, post.image); // Adjust if your image path is different
        const imageBuffer = fs.readFileSync(imagePath);
        const encodedImage = imageBuffer.toString('base64');

        // Send to Vision AI API for analysis
        const [result] = await client.annotateImage({
            image: { content: encodedImage },
            features: [{ type: 'LABEL_DETECTION' }], // You can modify the feature type if needed
        });

        // Debugging output: Log the Vision AI response for inspection
        console.log('Vision AI Response:', JSON.stringify(result, null, 2));

        // Handle the API response and check for empty results
        const labels = result.labelAnnotations && result.labelAnnotations.length > 0
            ? result.labelAnnotations.map(label => ({
                description: label.description,
                score: label.score,
            }))
            : [];

        // Log parsed labels for debugging
        console.log('Parsed Labels:', labels);

        // Respond with analysis result
        res.status(200).json({
            message: 'Image analyzed successfully',
            labels,
        });

        // Optionally, you can store the analysis back in MongoDB for future reference
        post.analysis = labels; // Add a field `analysis` to your Post schema if needed
        await post.save();

    } catch (error) {
        console.error('Error analyzing image:', error);
        res.status(500).json({ error: 'Failed to analyze image' });
    }
});

// Admin Dashboard Route
app.get('/admin/dashboard', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Fetch posts sorted by latest
        res.render('adminDashboard', { posts }); // Pass posts to EJS template
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Failed to load posts.');
    }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
