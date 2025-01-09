const express = require('express');
const path = require('path');
const multer = require('multer');
require('dotenv').config(); // Load environment variables
const vision = require('@google-cloud/vision');
const bodyParser = require('body-parser');
const Post = require('./models/post'); // Assuming Post model exists
const mongoose = require('mongoose');
const app = express();

// Set up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' }); // Temporary storage for the uploaded file

// Google Vision API client setup
const client = new vision.ImageAnnotatorClient();

// MongoDB connection setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Root Route (Render the EJS template for the home page)
app.get('/', (req, res) => {
    res.render('index'); // Ensure "index.ejs" is in the "views" folder
});
app.get('/admin', (req, res) => {
    res.render('admin'); // Ensure "index.ejs" is in the "views" folder
});

// Upload Route (Geolocation and Vision AI)
app.post('/api/upload', upload.single('photo'), async (req, res) => {
    try {
        const { description, location } = req.body;
        const photo = req.file;

        if (!photo || !description || !location) {
            return res.status(400).json({ error: 'Photo, description, and location are required.' });
        }

        // Parse the location data (Expected: { latitude, longitude })
        const locationData = JSON.parse(location); 

        // Send the image to the Vision AI for analysis
        const [result] = await client.labelDetection(photo.path);
        const labels = result.labelAnnotations;

        // Prepare image analysis result (labels identified by Vision AI)
        const analysisResult = labels.map(label => label.description).join(', ');

        // Save post to MongoDB
        const post = new Post({
            image: photo.path, // Save file path (You may choose to store it in a CDN or another location)
            comment: description || '',
            location: {
                type: 'Point',
                coordinates: [locationData.longitude, locationData.latitude], // Store coordinates [longitude, latitude]
            },
            analysis: analysisResult, // Add AI analysis result
        });

        await post.save();

        res.status(201).json({
            message: 'Photo uploaded successfully!',
            post: {
                id: post._id,
                image: post.image,
                description: post.comment,
                analysis: post.analysis,
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

// Serve Uploaded Files (static files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
