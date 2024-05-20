const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/mainroutes');

// for session
const setUserLocals = require('./middlewares/setUserLocals');
const session = require('express-session');
const crypto = require('crypto');

app.use(session({
  secret: crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false
}));
app.use(setUserLocals.setUserLocals);
// session

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
// Set view engine
app.set('view engine', 'ejs');

// Mount the userRoutes router at the root URL
app.use('/', userRoutes);
app.use('/api', userRoutes);

app.use(express.static('public'));

// MongoDB connection string with database name
const MONGODB_URI = 'mongodb+srv://harshitsrivastava374:5vXjxpj2hTCtuRzP@store.9i19cnu.mongodb.net/kirana_store_db?retryWrites=true&w=majority';

// Connect to MongoDB with specified options
mongoose.connect(MONGODB_URI)
  .then(async () => {
    try {
      // Fetch all collections in the database
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      // Print the names of all collections
      // collections.forEach(collection => {
      //   console.log(collection.name);
      // });
    
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
    
  })
  .catch(error => console.error('Error connecting to MongoDB:', error));



// Other middleware and route configurations...

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
