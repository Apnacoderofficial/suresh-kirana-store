const User = require('../models/user');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const mailer = require('./emailsender');
const toastMessage = require('./toastMessage');


const generateAccessToken = (payload) => {
    const token = jwt.sign({ data: payload }, process.env.JWT_SECRET, { expiresIn: '30m' });
    return token;
};
  
// cache store
const saveTokenInCookie = (res, token) => {
    // Save the token in the cookies
    res.cookie('token', token, {
      httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not by client-side scripts
      secure: process.env.NODE_ENV === 'production', // Ensures the cookie is only sent over HTTPS in production
      maxAge: 24 * 60 * 60 * 1000 // 1 day expiration
    });
  };

  exports.signin = (req, res) => {
    const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('pages/signin',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
  };
  
  exports.signup = (req, res) => {
    const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('pages/signup',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
  };

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
      const token = generateAccessToken({
        email:user.email,
        name:user.name,
        isLoggedIn:true
      });
      saveTokenInCookie(res, token);

      console.log("token",token);
      // Set session as active
      // req.session.user = user;
      // req.session.isLoggedIn = true;
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
  
  exports.forgotPassword = (req, res) => {
    const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('pages/forgot-password',{isLoggedIn, wishcount, cartcount, cartProducts ,category });
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
// Import the necessary modules

exports.logout = (req, res) => {
    try {
        if (req.cookies && req.cookies.token) {
            const tokenData = jwt.verify(req.cookies.token, process.env.JWT_SECRET).data;
            const userEmail = tokenData.email || 'Unknown';
            const userName = req.session.user ? req.session.user.name : 'User';

            console.log(`Logout: ${userEmail}`);
            mailer(userEmail, '', '', `Bye ! ${userName} 👋 `, `
                <div class="container">
                    <h1>Bye! <b>${userName}</b></h1>
                    <p>We hope that you have enjoyed our store services! Kindly visit again at your loved store.<br>
                    You logged out at: <strong>${new Date().toLocaleString()}</strong></p>
                </div>
            `);

            // Clear the token cookie
            res.clearCookie('token');

            // Destroy the session
            req.session.destroy(err => {
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).json({ message: 'Internal server error' });
                }


                // Redirect to the index page after logout
                res.redirect('/');
            });
        } else {
            // If no token is found, just redirect to the index page
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


  module.exports = exports;