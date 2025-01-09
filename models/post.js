const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for posts
const postSchema = new mongoose.Schema({
    image: { 
        type: String, 
        required: true, // Path or URL to the uploaded image is mandatory
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Reference to the User model
        required: true, // User field is mandatory
    },
    comment: { 
        type: String, 
        default: '' // Optional comment, default is an empty string
    },
    dueDate: { 
        type: Date // Optional due date for any associated task
    },
    createdAt: { 
        type: Date, 
        default: Date.now // Automatically set to the current date
    },
    location: { // Added geolocation field
        type: { type: String, default: 'Point' },
        coordinates: [Number], // Store [longitude, latitude]
    },
}, { timestamps: true });

// Create a geospatial index for efficient querying
postSchema.index({ location: '2dsphere' });

// Create and export the Post model
module.exports = mongoose.model('Post', postSchema);
