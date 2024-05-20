const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
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
  message: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Message', messageSchema);
