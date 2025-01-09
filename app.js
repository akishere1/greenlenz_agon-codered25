const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs'); // Optional for file system operations
const mongoose = require('./models/user'); 

const User = require('./models/user'); // Your user model
const Post = require('./models/post'); // Your post model

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// File Upload Middleware
const upload = multer({
    dest: 'uploads/', // Destination folder for uploaded files
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
});

// Import Routes
const authRoutes = require('./routes/auth');

// Use Routes
app.use('/auth', authRoutes);

// Routes
app.get('/', (req, res) => {
    res.render('index'); // Render home or landing page
});

app.get('/signin', (req, res) => {
    res.render('signin'); // Render signin page
});

app.get('/signup', (req, res) => {
    res.render('signup'); // Render signup page
});

// Handle File Uploads
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        const { description } = req.body;
        const photo = req.file;

        if (!photo || !description) {
            return res.status(400).json({ error: 'Photo and description are required.' });
        }

        console.log('Uploaded file:', photo);
        console.log('Description:', description);

        // Save metadata to the database (if required)
        const post = new Post({
            imagePath: photo.path, // Save the file path in your database
            description: description,
        });

        await post.save();

        // Respond with success
        res.status(200).json({
            message: 'Photo uploaded successfully!',
            photoUrl: `/uploads/${photo.filename}`, // Example public URL
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'An error occurred while uploading the file.' });
    }
});

// Serve Uploaded Files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Server Start
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


     