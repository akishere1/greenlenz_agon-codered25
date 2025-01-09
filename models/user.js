const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://eagonofficial:<db_password>@cluster0.t9h2d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    ssl: true,
    sslValidate: true,
    sslCA: '/path/to/ca.pem'
  });
  

mongoose
    .connect(connectionString, {
        dbName: '<database>',
    })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));


