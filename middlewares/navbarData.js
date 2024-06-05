const Category = require('../models/category');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const User = require('../models/user');

const navbarData = async (req, res, next) => {
  try {
    let isLoggedIn = false;
    let tokenData = null;
    let emailData = null;
    
    if (req.cookies && req.cookies.token) {
      try {
        tokenData = jwt.verify(req.cookies.token, process.env.JWT_SECRET).data;
        isLoggedIn = tokenData.isLoggedIn ? true : false; // Adjust as needed
        emailData = tokenData.email;
      } catch (error) {
        console.error('Invalid token:', error);
      }
    }
    
    const userData = await User.findOne({email: emailData}); // Use findOne instead of find
    // Your logic to fetch or calculate navbar data
    const category = await Category.find();
    const wishcount = userData && userData.wishlist ? userData.wishlist.length : 0; // Ensure userData and userData.wishlist exist
    const cartcount = userData && userData.cart ? userData.cart.length : 0; // Adjust as needed (e.g., fetch from database)
    const cartProducts = 0; // Adjust as needed (e.g., fetch from database)

    res.locals.navbarData = { isLoggedIn, wishcount, cartcount, cartProducts, category };
    next();
  } catch (error) {
    console.error('Error fetching navbar data:', error);
    res.status(500).render('error', { error: 'Failed to get navbar data' });
  }
};

module.exports = { navbarData };
