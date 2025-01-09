const mongoose = require('mongoose');

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
});

// Create and export the Post model
module.exports = mongoose.model('Post', postSchema);
