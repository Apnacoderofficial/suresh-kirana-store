const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  pid: {
    type: String,
    required: true
  },
  quantity: {
    type: Number, // Change 'number' to 'Number'
    required: true,
    min: 1 
  }
});

const orderSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  number: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  total_products: [itemSchema], // Define total_products as an array of items
  total_qty: {
    type: Number,
    required: true
  },
  total_price: {
    type: Number,
    required: true
  },
  serviceFee: {
    type: Number,
    required: true
  },
  deliveryCharges: {
    type: Number,
    required: true
  },
  placed_on: {
    type: Date,
    required: true
  },
  payment_status: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Order', orderSchema);
