const Category = require('../models/category');
const User = require('../models/user');
const Product = require('../models/products');
const Unit = require('../models/units');
const fees = '3';
const setUserLocals = async (req, res, next) => {
  try {
    // Check if req.session.user exists and has an email property
    if (req.session.user && req.session.user.email) {
      // Find the user by their email address
      const units = await Unit.find();
      const user = await User.findOne({ email: req.session.user.email }).populate('wishlist.pid');
      const cartUser = await User.findOne({ email: req.session.user.email }).populate('cart.pid');
      const cartUserquantity = await User.findOne({ email: req.session.user.email }).populate('cart.quantity');

      // Extract the product IDs from the user's
      const wishlistProductIds = user ? user.wishlist.map(item => item.pid) : [];
      
      // Find products based on the product IDs in the cart
      const cartProductIds = cartUser ? cartUser.cart.map(item => item.pid) : [];
      const cartProducts = await Product.find({ _id: { $in: cartProductIds } });
      const cartProductqty = cartUserquantity ? cartUserquantity.cart.map(item => item.quantity) : [];

// Prepare an array of objects containing product ID and quantity
const cartItems = cartProductIds.map((productId, index) => ({
    productId,
    quantity: cartProductqty[index] || 0 // Default quantity to 0 if not found (safety check)
}));

// Set cart items in res.locals for use in views or subsequent middleware
res.locals.cartItems = cartItems;
      
      // Calculate total price of products in the cart
  // Initialize cart total price
let cartTotalPrice = 0;

// Loop through each product in the cartProducts array
for (const product of cartProducts) {
    // Find the corresponding cart item by productId
    const cartItem = cartItems.find(item => item.productId.toString() === product._id.toString());

    // If the cart item for the current product is found
    if (cartItem) {
        // Calculate the total price for this product based on its quantity
        const totalPriceForProduct = product.discounted_price * cartItem.quantity;

        // Add the calculated total price for this product to the cartTotalPrice
        cartTotalPrice += totalPriceForProduct;
    }
}
let delivery_fee;
  // Assuming carttotalprice is a numeric variable holding the total price
  // of items in the cart
  if (cartTotalPrice <= 299) {
    delivery_fee = 10;
  } else {
    delivery_fee = 0;
  }

      // Get categories
      const categories = await Category.find();
      // Set user, isLoggedIn, category, wishlist count, cart count, cart products, and cart total price in res.locals
      res.locals.user = user;
      res.locals.isLoggedIn = !!user; // Set isLoggedIn to true if user is found
      res.locals.category = categories || [];
      res.locals.wishcount = wishlistProductIds.length;
      res.locals.cartcount = cartProductIds.length;
      res.locals.cartProductId = cartProductIds;
      res.locals.cartProducts = cartProducts;
      res.locals.carttotalprice = cartTotalPrice;
      res.locals.cartqty = cartUserquantity;
      res.locals.fee = fees;
      res.locals.delivery_fee = delivery_fee;
      res.locals.units = units;

      // Move to the next middleware
      next();
    } else {
      // If req.session.user is not set, proceed without setting locals
      res.locals.user = null;
      res.locals.isLoggedIn = false;
      res.locals.category = [];
      res.locals.wishcount = 0;
      res.locals.cartcount = 0;
      res.locals.cartProducts = [];
      res.locals.carttotalprice = 0;
      res.locals.units = [];
      next();
    }
  } catch (error) {
    console.error('Error setting user locals:', error);
    next(error); // Pass error to the next middleware
  }
};

module.exports = { setUserLocals };
