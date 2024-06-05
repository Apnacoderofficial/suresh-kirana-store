// User route end
const Order = require('../models/orders');
const User = require('../models/user');
const Product = require('../models/products');
const Unit = require('../models/units');
const Settings = require('../models/setting');
const { decodeToken } = require('../middlewares/decodeJwt');




exports.accountOrders = async (req, res) => {
    try {
        const user = decodeToken(req.cookies.token);
      // Check if the user is logged in before rendering the account orders page

        const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
        const orders = await Order.find({ email: user.email });
        res.render('users/account-orders', { Orders: orders , isLoggedIn, wishcount, cartcount, cartProducts,category });
    } catch (error) {
      console.error('Error getting account orders:', error);
      res.status(500).render('error', { error: 'Failed to get account orders' });
    }
  };
  
  
  exports.accountSettings = async (req, res) => {
    // Check if the user is logged in before rendering the account settings page
      try {
        const users = decodeToken(req.cookies.token);
        const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
        // Fetch the user data from the database
        const user = await User.findOne({ email: users.email });
  
        if (!user) {
          return res.status(404).render('error', { error: 'User not found' });
        }
  
        // Render the account settings page with the user data
        res.render('users/account-settings', { user, isLoggedIn, wishcount, cartcount, cartProducts , category});
      } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).render('error', { error: 'Failed to fetch user data' });
      }
  };
  
  exports.accountUpdate = async (req, res) => {
    // Check if the user is logged in before updating account details

      try {
        const user = decodeToken(req.cookies.token);
        // Retrieve the user ID from the session or req.body (depending on your implementation)
        const userId = user._id; // Adjust this according to your session structure
  
        // Extract updated user details from the form submission
        const { name, email, phone, pass, cpass } = req.body;
  
        // Check if the new password matches the current password
        if (pass === cpass) {
          // Update the user details in the database
          console.log(`Updated Successfully`);
          await User.findByIdAndUpdate(userId, { name, email, phone, password: pass });
  
          // Redirect the user to a success page or reload the account settings page
          res.redirect('/account-settings');
        } else {
          // If passwords don't match, render an error message
          res.status(400).render('error', { error: 'Passwords do not match' });
        }
      } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).render('error', { error: 'Failed to update user details' });
      }
  };
  
  
  exports.accountAddress = async (req, res) => {

    try {
        const users = decodeToken(req.cookies.token);
      // Fetch the user data from the database
      const user = await User.findOne({ email: users.email });
      const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
  
      if (!user) {
        return res.status(404).render('error', { error: 'User not found' });
      }
  
      // Render the account settings page with the user data
    
      res.render('users/account-address', { user,isLoggedIn, wishcount, cartcount, cartProducts ,category });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).render('error', { error: 'Failed to fetch user data' });
    }
  };
  
  exports.accountPaymentMethod = (req, res) => {
    // Check if the user is logged in before rendering the account payment method page
      const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('users/account-payment-method',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
  };
  
  exports.accountNotification = (req, res) => {
    // Check if the user is logged in before rendering the account notification page
      const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('users/account-notification',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
  };
  exports.accountresetpass = (req, res) => {
    const users = decodeToken(req.cookies.token);
    // Check if the user is logged in before rendering the account notification page
      const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('users/account-resetpass',{isLoggedIn, wishcount, cartcount, cartProducts ,category,user:users });
  };
exports.shopWishlist = async (req, res) => {
    try {
      const setting = await Settings.find().limit(1);
      
      const users = decodeToken(req.cookies.token);
      const { isLoggedIn, wishcount, cartcount, cartProducts, category} = res.locals.navbarData || {};

      // Find the user by their email address
      const user = await User.findOne({ email: users.email }).populate('wishlist.pid');

      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Extract the product IDs from the user's wishlist
      const wishlistProductIds = user.wishlist.map(item => item.pid);

      // Count the number of product IDs in the wishlist
      const pidCount = wishlistProductIds.length;

      // Find products based on the product IDs in the wishlist
      const products = await Product.find({ _id: { $in: wishlistProductIds } });

      // Render the shop-wishlist page with the wishlist products and count
      res.render('pages/wishlist', { products: products, wishlistProductIds: wishlistProductIds, pidCount: pidCount,isLoggedIn, wishcount, cartcount, cartProducts , category,setting });

    } catch (error) {
      console.error('Error fetching user wishlist:', error);
      res.status(500).render('error', { error: 'Failed to fetch user wishlist' });
    }
};
exports.shopCart = async (req, res) => {
    try {
      const setting = await Settings.find().limit(1);
      
      const user = decodeToken(req.cookies.token);
      const { isLoggedIn, wishcount, cartcount, cartProducts, category} = res.locals.navbarData || {};
      const product = await Product.find();
      const unit = await Unit.find();

 const users = await User.findOne({ email: user.email });
     res.render('pages/shop-cart', { categories:category,category,users,product,unit,isLoggedIn, wishcount, cartcount, cartProducts , category,setting});
    } catch (error) {
      // Handle any errors that occur during category fetching
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
    }
};
exports.shopCheckout = async (req, res) => {
    try {
      const setting = await Settings.find().limit(1);
      
      const { isLoggedIn, wishcount, cartcount, cartProducts, category } = res.locals.navbarData || {};

      const product = await Product.find();
      const unit = await Unit.find();
      const user = decodeToken(req.cookies.token);

      const users = await User.findOne({ email: user.email });

      res.render('pages/shop-checkout', {
        categories: category,
        users, // Pass the entire users object
        product,
        unit,
        isLoggedIn,
        wishcount,
        cartcount,
        cartProducts,
        category,setting
      });
    } catch (error) {
      // Handle any errors that occur during category fetching
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
    }
};


module.exports = exports;