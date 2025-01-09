const mongoose = require('mongoose');
require('dotenv').config(); 

// MongoDB Atlas connection string (Make sure to replace <database> with your actual database name)
const connectionString = process.env.DB_CONNECTION_STRING || 'mongodb+srv://tryhariomsk:5zmmGkYobOq1RxBS@cluster0.jas61.mongodb.net/greenlens?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect('mongodb+srv://tryhariomsk:5zmmGkYobOq1RxBS@cluster0.jas61.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  dbName: 'greenlens',  // Replace with your database name
  tlsAllowInvalidCertificates: true  // Disable certificate validation temporarily
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// // Connect to MongoDB Atlas
// mongoose.connect(connectionString, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     dbName: 'your-database-name',  // Replace with your actual database name
// })
// .then(() => console.log('Connected to MongoDB Atlas'))
// .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));