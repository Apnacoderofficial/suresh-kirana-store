const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  // You can add more fields as needed
});

module.exports = mongoose.model('Unit', unitSchema);
