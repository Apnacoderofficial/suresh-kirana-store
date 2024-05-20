  // category.js

  const mongoose = require('mongoose');
  const { v4: uuidv4 } = require('uuid');

  const subcategorySchema = new mongoose.Schema({
    id: { 
      type: String ,  
      required: true,
      default: uuidv4
    },
    name: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    },
    images: {
      type: String
    },
    createdat: {
      type: Date,
    }
  });

  const categorySchema = new mongoose.Schema({
    id: { type: String ,  default: uuidv4},
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    images: {
      type: String,
      required: true,
      unique: true
    },
    subcategory: [subcategorySchema],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }, { collection: 'category' }); // Specify the collection name as 'category'

  module.exports = mongoose.model('Category', categorySchema); // Export the model as 'Category'
