const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
  id: { type: String ,  default: uuidv4},
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  subcategory: {
    type: String,
    required: false
  },
  details: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  units: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  discounted_price: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Product', productSchema);
