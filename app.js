const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
require('dotenv').config(); // Load environment variables

const User = require('./models/user'); // User model
const Post = require('./models/post'); // Post model

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// File Upload Middleware
const upload = multer({
    dest: path.join(__dirname, 'uploads'), // Destination folder for uploads
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Routes
app.get('/', (req, res) => {
    res.render('index'); // Render homepage
});

app.get('/signin', (req, res) => {
    res.render('signin'); // Render signin page
});

app.get('/signup', (req, res) => {
    res.render('signup'); // Render signup page
});

// Upload Route
app.post('/api/upload', upload.single('photo'), async (req, res, next) => {
    try {
        const { userId, description } = req.body; // User ID and description
        const photo = req.file;

        if (!photo || !userId) {
            return res.status(400).json({ error: 'Photo and user ID are required.' });
        }

        // Validate user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Save post to database
        const post = new Post({
            image: photo.path, // Save file path
            user: user._id, // Reference user
            comment: description || '', // Optional description
        });

        await post.save();

        res.status(201).json({
            message: 'Photo uploaded successfully!',
            post: {
                id: post._id,
                image: post.image,
                user: post.user,
                comment: post.comment,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        next(error);
    }
});

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
