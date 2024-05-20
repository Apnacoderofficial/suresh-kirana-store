const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true
  }
});

const cartItemSchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true // Assuming default quantity is 1
  }
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  user_type: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
  },
  image: {
    type: String
  },
  resetToken: {
    type: String
  },
  wishlist: [wishlistItemSchema], // Define wishlist as an array of wishlist items
  cart: [cartItemSchema] // Define cart as an array of cart items
});

module.exports = mongoose.model('User', userSchema);
