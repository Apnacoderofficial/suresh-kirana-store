const User = require('../models/user');
const Product = require('../models/products');
const Category = require('../models/category');
const Unit = require('../models/units');
const Order = require('../models/orders');
const Message = require('../models/message');
const { checkAuth } = require('../middlewares/checkAuth');
const mailer = require('./emailsender');
const Settings = require('../models/setting');
const { decodeToken } = require('../middlewares/decodeJwt');





// exports.index = async (req, res) => {
//   try {
//     const products = await Product.find();
     
//     const unit = await Unit.find();
//     const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    
//     res.render('index', { 
//       products: products,
//       category: category,
//     unit,isLoggedIn, wishcount, cartcount, cartProducts ,category });
//   }catch{
//     console.error('Error getting index page data:', error);
//     res.status(500).render('error', { error: 'Failed to get index page data' });
//   }
// };










exports.shopGrid3Column = (req, res) => {
    res.render('pages/shop-grid-3-column');
};

exports.shopList = (req, res) => {
    res.render('pages/shop-list');
};

exports.shopFilter = (req, res) => {
    res.render('pages/shop-filter');
};

exports.shopFullwidth = (req, res) => {
    res.render('pages/shop-fullwidth');
};

exports.shopSingle = (req, res) => {
    res.render('pages/shop-single');
};

exports.shopSingle2 = (req, res) => {
    res.render('pages/shop-single-2');
};







exports.storeList = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/store-list',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};

exports.storeGrid = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/store-grid',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};

exports.storeSingle = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/store-single',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};

exports.blog = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/blog',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};

exports.blogSingle = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/blog-single',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};

exports.blogCategory = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/blog-category',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};



exports.error404 = (req, res) => {
  const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
    res.render('pages/404error',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
};










// All Post 
exports.addToCart = async (req, res) => {
  // Check user authentication using checkAuth middleware
  checkAuth(req, res, async () => {
    try {
      const users = decodeToken(req.cookies.token);
      const productId = req.body.productId;
      const quantity = parseInt(req.body.quantity); // Ensure quantity is parsed as an integer
      
      
      // Find the user by their email address
      const user = await User.findOne({ email: users.email });
      
      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Check if the product already exists in the user's cart
      const existingProductIndex = user.cart.findIndex(item => item.pid === productId);
      
      if (existingProductIndex !== -1) {
        // Product already exists in cart, update its quantity
        user.cart[existingProductIndex].quantity += quantity;
        console.log('Product already exists in cart, update its quantity');
      } else {
        // Product does not exist in cart, add it
        user.cart.push({ pid: productId, quantity: quantity });
        console.log('Product does not exist in cart, add it');
      }
      
      // Save the updated user to the database
      await user.save();
      
      // Send a success response
      res.json({ success: true, message: 'Product added to cart successfully!' });
      
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ error: 'Failed to add product to cart' });
    }
  });
};

exports.updateCartQuantity = async (req, res) => {
  const { productId, action } = req.body;
  
  
  try {
    const users = decodeToken(req.cookies.token);
      let user = await User.findOne({ email: users.email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }  

      // Find the index of the product in the user's cart
      const index = user.cart.findIndex(item => item.pid.toString() === productId);

      // If the product is not found in the cart, return an error
      if (index === -1) {
          return res.status(404).json({ error: 'Product not found in cart' });
      }

      // Perform the action based on the provided action parameter
      if (action === 'decrease') {
          if (user.cart[index].quantity > 1) {
              user.cart[index].quantity--;
          } else {
              // If the quantity is already 1 and the user tries to decrease further,
              // you might want to remove the item from the cart instead
              user.cart.splice(index, 1);
          }
      } else if (action === 'increase') {
          user.cart[index].quantity++;
      } else {
          // Handle invalid action
          return res.status(400).json({ error: 'Invalid action' });
      }

      // Save the updated user object
      await user.save();

      // Redirect the user back to the cart page
      res.redirect('/shop-cart');
  } catch (error) {
      // Handle any errors
      console.error('Error updating cart quantity:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
}


exports.removeFromCart = async (req, res) => {
  try {
      const productId = req.params.productId;
      const users = decodeToken(req.cookies.token);
      const user = await User.findOne({ email: users.email });
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }
      user.cart = user.cart.filter(item => item.pid !== productId);     
      await user.save();
      res.redirect('/shop-cart');

  } catch (error) {
      console.error('Error removing product from cart:', error);
      res.status(500).json({ error: 'Failed to remove product from cart' });
  }
};
exports.viewInvoice = async (req, res) => {
  try {
    const invoiceId = req.params.invoiceId;
    const setting = await Settings.find().limit(1);

    // Find the order by orderId
    const order = await Order.findOne({ _id: invoiceId });

    // Check if the order exists
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create an array to store product details
    const productDetails = [];

    // Loop through each product in the order's total_products array
    for (const product of order.total_products) {
      // Find the product by pid in the product table
      const foundProduct = await Product.findOne({ _id: product.pid });

      // If product is found, add its details to the productDetails array
      if (foundProduct) {
        productDetails.push({
          image: foundProduct.image,
          name: foundProduct.name,
          price: foundProduct.price,
          quantity: product.quantity
        });
      }
    }

    // Render the invoice template with the order data and product details
    res.render('./dashboard/invoice', { order, productDetails });
  } catch (error) {
    console.error('Error viewing invoice:', error);
    res.status(500).json({ error: 'Failed to view invoice' });
  }
};




exports.addToWishlist = async (req, res) => {
  // Check user authentication using checkAuth middleware
  checkAuth(req, res, async () => {
    try {
      const { productId } = req.body;
      const users = decodeToken(req.cookies.token);
      const user = await User.find({email:users.email});

      // Check if the user exists
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if the product already exists in the user's wishlist
      const productExists = user.wishlist.some(item => item.pid === productId);

      if (productExists) {
        // Product already exists in wishlist, return without adding again
        return res.redirect(req.headers.referer || '/');
        
      }

      // Add the product to the user's wishlist
      user.wishlist.push({ pid: productId }); // Assuming you only need to store the product ID in the wishlist
      
      // Save the updated user to the database
      await user.save();

      // Redirect the user to the wishlist page with a success message
      res.redirect(req.headers.referer || '/');

    } catch (error) {
      console.error('Error adding product to wishlist:', error);
      res.status(500).json({ error: 'Failed to add product to wishlist' });
    }
  });
};

 // Controller function to delete item from wishlist
 exports.removeFromWishlist = async (req, res) => {
  try {
    // Retrieve the product ID from the request body
    const productId = req.body.productId;

    // Retrieve the user's email from the session
    const users = decodeToken(req.cookies.token);

    // Find the user by their email
    const user = await User.findOne({ email: users.email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove the item from the user's wishlist based on the product ID
    user.wishlist = user.wishlist.filter(item => item.pid.toString() !== productId);

    // Save the updated user to the database
    await user.save();

    // Redirect or send response indicating successful deletion
    res.redirect('/wishlist'); // Redirect to the wishlist page or any other appropriate page
  } catch (error) {
    console.error('Error deleting item from wishlist:', error);
    res.status(500).json({ error: 'Failed to delete item from wishlist' });
  }
};

const toastify = require('toastify-js');

exports.order = (req, res) => {
  checkAuth(req, res, async () => {
    try {
      // Extract order data from request body
      const { user_id, name, number, email, method, address, total_products, total_qty, total_price, placed_on, payment_status, deliveryCharges, serviceFee } = req.body;

      const products = [];
      const productStrings = total_products.split(',');
      productStrings.forEach(productString => {
        const [pid, quantity] = productString.split(':');
        products.push({ pid, quantity: parseInt(quantity) }); // Parse quantity to integer
      });

      console.log(products);

      // Create a new order instance
      const newOrder = new Order({
        user_id,
        name,
        number,
        email,
        method,
        address,
        total_products: products, // Set the total_products field to the array of objects
        total_qty,
        total_price,
        placed_on,
        payment_status,
        serviceFee,
        deliveryCharges
      });

      console.log(newOrder);

      // Save the order to the database
      const savedOrder = await newOrder.save();

      // Send emails
      mailer(email, '', '', `Your Order Has been placed Successfully! Order #${user_id.toString().slice(-5)} 😊 `, `<div class="container">
          <h1>We have Received you request ! <b> ${name}</b></h1>
          <p>We hope you are enjoying your shopping journey with us.we have received you current order.<br>
          Your order id: <strong>#${user_id.toString().slice(-5)}</strong><br>
          Payment Method: <strong>${method}</strong><br>
          Amount to be Pay: <strong>${total_price}</strong><br>
          Shipping Address: <strong>${address}</strong><br>
          </p>
      </div>`);

      mailer('quickhatastore@gmail.com', '', '', `New Order Received ! Order #${user_id.toString().slice(-5)} 😊 `, `<div class="container">
          <h1>New order Request Received by ! <b> ${name}</b></h1>
          <p>Order Details Are Given Below.<br>
          Order id: <strong>#${user_id.toString().slice(-5)}</strong><br>
          Payment Method: <strong>${method}</strong><br>
          Amount to be Pay: <strong>${total_price}</strong><br>
          Shipping Address: <strong>${address}</strong><br>
          </p>
      </div>`);

      // Log the _id of the newly inserted order
      console.log('New order _id:', savedOrder._id);

      // Empty the user's cart after successful order creation
      await User.updateOne({ _id: user_id }, { cart: [] });

      // Render HTML with Toastify and redirection
const html = `
<html>
  <head>
    <link href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/toastify-js"></script>
  </head>
  <body>
    <script>
      // Show Toastify notification
      Toastify({
        text: "Order placed successfully!",
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: "#4CAF50",
        callback: function() {
          // Redirect after a delay
          setTimeout(function() {
            window.location.href = '/'; // Redirect to home page
          }, 10); // Adjust the delay as needed
        }
      }).showToast();
    </script>
  </body>
</html>
`;

res.send(html);

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).send('Failed to create order');
    }
  });
};


exports.cancelorder = async (req, res) => {
  const orderId = req.body.id; // Use a descriptive variable name
  const setting = await Settings.find().limit(1);
  const users = decodeToken(req.cookies.token);


  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      { payment_status: 'Cancelled' },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return res.status(404).send('Order not found');
    }

    // Send cancellation confirmation email (optional)
    const emailContent = `Your Order #${orderId} has been cancelled.`;
    mailer(users.email, '', '', 'Order Cancelled Notification', emailContent);
    mailer(setting[0].email, '', '', 'Order Cancelled Notification', emailContent);

    console.log({"status": 'Order cancelled successfully'});
    res.redirect('/account-orders') // More informative response
  } catch (error) {
    console.error(error);
    res.status(500).send('Error cancelling order'); // Handle internal errors
  }
};









module.exports = exports;

