// middleware.js

const checkAuth = (req, res, next) => {
  if (req.session.isLoggedIn) {
    // User is logged in, proceed to the next middleware or route handler
    next();
  } else {
    // User is not logged in, redirect to the signin page
    res.redirect('/signin');
  }
};

module.exports = { checkAuth };
