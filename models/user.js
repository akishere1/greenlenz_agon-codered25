const mongoose = require('mongoose');

// MongoDB connection string (use the correct string for your cluster)
const connectionString = 'mongodb+srv://tryhariomsk:5zmmGkYobOq1RxBS@cluster0.jas61.mongodb.net/greenlens?retryWrites=true&w=majority';

mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsAllowInvalidCertificates: true // Only use this option if absolutely necessary
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

module.exports = mongoose;


