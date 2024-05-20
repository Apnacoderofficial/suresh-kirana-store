const User = require('../models/user');
const Product = require('../models/products');
const Category = require('../models/category');
const Unit = require('../models/units');
const Order = require('../models/orders');
const Message = require('../models/message');
const jwt = require('jsonwebtoken');

const { checkAuth } = require('../middlewares/checkAuth');
const mailer = require('./emailsender');
const units = require('../models/units');
// const category = require('../models/category');



// Login Logout controller function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate password (compare hashed passwords)
    // Note: For production, it's recommended to use a secure method like bcrypt for password hashing
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    console.log('Login Successfully', user.email);
    
    // Set session as active
    req.session.user = user;
    req.session.isLoggedIn = true;
    mailer(user.email, '', '', `Welcome Back! ${user.name} 😊 `, `<div class="container">
          <h1>Welcome Back! <b> ${user.name}</b></h1>
          <p>We are happy to see you back ! Enjoy your Shopping at our Loved Store.<br>You logged in at: <strong>${new Date().toLocaleString()}</strong></p>
      </div>`);

    // Redirect based on user role
    if (user.user_type === 'admin') {
      return res.redirect('/dashboard/index');
    } else {
      return res.redirect('/index');
    }

  } catch (error) {
    console.error('Error sending email:', error);
    console.error('Login error:', error);
    // return res.status(500).json({ message: 'Internal server error' });
    return res.redirect('/signin');
  }
};
exports.register = async (req, res) => {
  const { fname, lname, phone, email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (user) {
      // User already exists, redirect to signin page
      return res.redirect('/signin');
    }


    // Create a new user
    const newUser = new User({
      name: `${fname} ${lname}`,
      phone,
      email,
      password,
      user_type: 'user'  // Ensure to hash the password before saving it to the database
    });
    

    // Save the new user to the database
    await newUser.save();

    // Set session as active
    req.session.user = newUser;
    req.session.isLoggedIn = true;
    mailer(req.session.user.email, '', '', `Welcome ! ${req.session.user.name} 🙋‍♂️ `, `<div class="container">
    <h1>Welcome! <b> ${req.session.user.name}</b></h1>
    <p>Welcome to our Store. we have multiple offer for our customers.We have different types of sales for our Customers.<br>
    Account Details Are : <br>
    Name: <strong>${req.session.user.name}</strong><br>
    Email: <strong>${req.session.user.email}</strong><br>
    Phone Number: <strong>${req.session.user.phone}</strong><br>
    Account Created at: <strong>${new Date().toLocaleString()}</strong></p>
    <br><p>Once Again We are Happy to see you in our Store. Enjoy your Shopping by Clicking on Button</p>
    <a class="btn btn-success btn-md p-2" href="https://suresh-kirana-store.onrender.com/shop">Shop Now</a>
</div>`);

    // Redirect to the index page or any other desired page
    return res.redirect('/index');

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
exports.forgotpass = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // const resetToken = generateResetToken(); // You need to implement this function
    // user.resetPasswordToken = resetToken;
    // user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    
    console.log('Password is', user.password);
    res.redirect('/signin'); // Redirect to the reset password page
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
};
exports.deleteAccount = async (req, res) => {
  try {
    // Retrieve the user ID from the request body
    const userId = req.body.userId;

    // Find the user by their ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Perform any necessary cleanup or additional actions before deleting the user
    // For example, deleting associated data or logging out the user

    mailer(user.email, '', '', `Bye Bye ! ${user.name} ☹️ `, `<div class="container">
          <h1>Bye Bye ! <b> ${user.name}</b></h1>
          <p>We are upset to see you go . I hope you have enjoyed our services.<br>Your Account Deleted at: <strong>${new Date().toLocaleString()}</strong></p>
      </div>`);
    
    // Delete the user account
    await User.deleteOne({ _id: userId });

    // Destroy all sessions
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying sessions:', err);
        return res.status(500).json({ error: 'Failed to destroy sessions' });
      }
      // Redirect or send response indicating successful deletion
      res.redirect('/'); // Redirect to the home page or any other appropriate page
    });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ error: 'Failed to delete user account' });
  }
};

// Logout controller
exports.logout = (req, res) => {
  // Get the email of the logged-out user from the session
  const userEmail = req.session.user ? req.session.user.email : 'Unknown';
  // Send logout email
  // Log the logout event along with the user's email
  console.log(`Logout: ${userEmail}`);
  mailer(userEmail, '', '', `Bye ! ${req.session.user.name} 👋 `, `<div class="container">
          <h1>Bye! <b> ${req.session.user.name}</b></h1>
          <p>We hope that you have enjoyed our store Services ! Kindly Visit Again at your Loved Store.<br>You logged out at: <strong>${new Date().toLocaleString()}</strong></p>
      </div>`);
  // Clear session variables
  req.session.destroy(err => {
      if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ message: 'Internal server error' });
      }
      // Redirect to the login page or any other page after logout
      res.redirect('/index');
  });
};


exports.index = async (req, res) => {
  try {
    const products = await Product.find();
    const category = await Category.find(); 
    const unit = await Unit.find();
    
    res.render('index', { 
      products: products,
      category: category,
    unit  });
  }catch{
    console.error('Error getting index page data:', error);
    res.status(500).render('error', { error: 'Failed to get index page data' });
  }
};

exports.shopWishlist = async (req, res) => {
  // Check user authentication using checkAuth middleware
  checkAuth(req, res, async () => {
    try {
      // Retrieve the user's email address from the session
      const userEmail = req.session.user.email;

      // Find the user by their email address
      const user = await User.findOne({ email: userEmail }).populate('wishlist.pid');

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
      res.render('pages/wishlist', { products: products, wishlistProductIds: wishlistProductIds, pidCount: pidCount });

    } catch (error) {
      console.error('Error fetching user wishlist:', error);
      res.status(500).render('error', { error: 'Failed to fetch user wishlist' });
    }
  });
};




exports.shopGrid = async (req, res) => {
  try {
    let products;
    const sub = req.query.sub;
    const subid = req.query.id;
    const categoryname = req.query.category;
    const categoryid = req.query.catid;
    const search = req.query.search;
    if (subid != null && subid !== '') {
      products = await Product.find({ subcategory: subid });
    } else if (categoryid != null && categoryid !== '') {
      products = await Product.find({ category: categoryid });
    } else if (search != null && search !== '') {
      products = await Product.find({ name:search });
    } else {
      products = await Product.find(); // Fetch all products if no specific sub or category
    }
    const category = await Category.find();
    const unit = await Unit.find();

    // Calculate the total number of products
    const totalProducts = products.length;
    res.render('pages/shop-grid', { products: products,category: category,totalProducts: totalProducts,sub,subid,categoryid,categoryname,unit});
  } catch (error) {
    console.error('Error getting shop grid page data:', error);
    res.status(500).render('error', { error: 'Failed to get shop grid page data' });
  }
};


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

exports.shopCart = (req, res) => {
  checkAuth(req, res, async () => {
    try {
      const categories = await Category.find();
      const product = await Product.find();
      const unit = await Unit.find();

 const users = await User.findOne({ email: req.session.user.email });
     res.render('pages/shop-cart', { categories,users,product,unit});
    } catch (error) {
      // Handle any errors that occur during category fetching
      console.error('Error fetching categories:', error);
      res.status(500).send('Internal Server Error');
    }
  });
};


exports.shopCheckout = (req, res) => {
  checkAuth(req, res, async () => {    
    res.render('pages/shop-checkout');
  });
};



exports.storeList = (req, res) => {
    res.render('pages/store-list');
};

exports.storeGrid = (req, res) => {
    res.render('pages/store-grid');
};

exports.storeSingle = (req, res) => {
    res.render('pages/store-single');
};

exports.blog = (req, res) => {
    res.render('pages/blog');
};

exports.blogSingle = (req, res) => {
    res.render('pages/blog-single');
};

exports.blogCategory = (req, res) => {
    res.render('pages/blog-category');
};

exports.about = (req, res) => {
    res.render('pages/about');
};

exports.error404 = (req, res) => {
    res.render('pages/404error');
};

exports.contact = (req, res) => {
    res.render('pages/contact');
};

exports.signin = (req, res) => {
    res.render('pages/signin');
};

exports.signup = (req, res) => {
    res.render('pages/signup');
};

exports.forgotPassword = (req, res) => {
    res.render('pages/forgot-password');
};
// User route end


exports.accountOrders = async (req, res) => {
  try {
    // Check if the user is logged in before rendering the account orders page
    await checkAuth(req, res, async () => {
      const orders = await Order.find({ email: res.locals.user.email });
      res.render('users/account-orders', { Orders: orders });
    });
  } catch (error) {
    console.error('Error getting account orders:', error);
    res.status(500).render('error', { error: 'Failed to get account orders' });
  }
};


exports.accountSettings = (req, res) => {
  // Check if the user is logged in before rendering the account settings page
  checkAuth(req, res, async () => {
    try {
      // Fetch the user data from the database
      const user = await User.findOne({ email: res.locals.user.email });

      if (!user) {
        return res.status(404).render('error', { error: 'User not found' });
      }

      // Render the account settings page with the user data
      res.render('users/account-settings', { user });
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).render('error', { error: 'Failed to fetch user data' });
    }
  });
};

exports.accountUpdate = (req, res) => {
  // Check if the user is logged in before updating account details
  checkAuth(req, res, async () => {
    try {
      // Retrieve the user ID from the session or req.body (depending on your implementation)
      const userId = req.session.user._id; // Adjust this according to your session structure

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
  });
};


exports.accountAddress = (req, res) => {
 // Check if the user is logged in before rendering the account settings page
 checkAuth(req, res, async () => {
  try {
    // Fetch the user data from the database
    const user = await User.findOne({ email: res.locals.user.email });

    if (!user) {
      return res.status(404).render('error', { error: 'User not found' });
    }

    // Render the account settings page with the user data
  
    res.render('users/account-address', { user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).render('error', { error: 'Failed to fetch user data' });
  }
});
};

exports.accountPaymentMethod = (req, res) => {
  // Check if the user is logged in before rendering the account payment method page
  checkAuth(req, res, () => {
    res.render('users/account-payment-method');
  });
};

exports.accountNotification = (req, res) => {
  // Check if the user is logged in before rendering the account notification page
  checkAuth(req, res, () => {
    res.render('users/account-notification');
  });
};




// All Post 
exports.addToCart = async (req, res) => {
  // Check user authentication using checkAuth middleware
  checkAuth(req, res, async () => {
    try {
      const productId = req.body.productId;
      const quantity = parseInt(req.body.quantity); // Ensure quantity is parsed as an integer
      
      // Retrieve the user's email address from the session
      const userEmail = req.session.user.email;
      
      // Find the user by their email address
      const user = await User.findOne({ email: userEmail });
      
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
      
      // Redirect the user to the cart page with a success message
      res.redirect(req.headers.referer || '/cart');
      
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ error: 'Failed to add product to cart' });
    }
  });
};
exports.updateCartQuantity = async (req, res) => {
  const { productId, action } = req.body;
  const userEmail = req.session.user.email;
  
  try {
      let user = await User.findOne({ email: userEmail });
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
      const userEmail = req.session.user.email;
      const user = await User.findOne({ email: userEmail });
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
      // Find the user by their ID (assuming you have the user ID stored in the session)
      const userId = req.session.user._id; // Adjust this according to your session structure
      const user = await User.findById(userId);

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
    const userEmail = req.session.user.email;

    // Find the user by their email
    const user = await User.findOne({ email: userEmail });

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

exports.order = (req, res) => {
  checkAuth(req, res, async () => {
    try {
      // Extract order data from request body
      const { user_id, name, number, email, method, address, total_products, qty, total_price, placed_on, payment_status } = req.body;

      // Convert the total_products and qty strings to arrays
      const productsArray = total_products.split(',');
      const quantitiesArray = qty.split(',');

      // Create a new array to store the product objects
      const products = [];

      // Iterate over the productsArray and construct objects with the pid and quantity properties
      productsArray.forEach((product, index) => {
        const [pid, quantity] = product.split(':'); // Split product into pid and quantity
        const qty = quantitiesArray[index];
        products.push({ pid, quantity: parseInt(qty) }); // Add pid and quantity to the product object
      });

      // Create a new order instance
      const newOrder = new Order({
        user_id,
        name,
        number,
        email,
        method,
        address,
        total_products: products, // Set the total_products field to the array of objects
        total_price,
        placed_on,
        payment_status
      });

      // Save the order to the database
      const savedOrder = await newOrder.save();
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

      // Redirect to the home page after successful order creation
      res.redirect('/');
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });
};









module.exports = exports;

