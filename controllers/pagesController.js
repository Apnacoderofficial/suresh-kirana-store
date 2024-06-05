const Product = require('../models/products');
const Unit = require('../models/units');
const User = require('../models/user');
const { decodeToken } = require('../middlewares/decodeJwt');




exports.index = async (req, res) => {
    try {
        const products = await Product.find();
        const unit = await Unit.find();
        const { isLoggedIn, wishcount, cartcount, cartProducts, category } = res.locals.navbarData || {};
        const user = decodeToken(req.cookies.token)?decodeToken(req.cookies.token):'';
        console.log(user);
        res.render('index', { 
            products: products,
            category: category,
            unit, 
            isLoggedIn, 
            wishcount, 
            cartcount, 
            cartProducts,
            user
        });
    } catch (error) {
        console.error('Error getting index page data:', error);
        res.status(500).render('error', { error: 'Failed to get index page data' });
    }
};

exports.about = async (req, res) => {
    const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('pages/about',{isLoggedIn, wishcount, cartcount, cartProducts,category });
  };

exports.shop = async (req, res) => {
    try {
      const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      const sub = req.query.sub;
      const subid = req.query.id;
      const categoryname = req.query.category;
      const categoryid = req.query.catid;
      const search = req.query.search;
  
      const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
      const limit = parseInt(req.query.limit) || 12; // Default to 10 products per page if not provided
  
      const startIndex = (page - 1) * limit;
      
      let query = {};
  
      if (subid) {
        query.subcategory = subid;
      } else if (categoryid) {
        query.category = categoryid;
      } else if (search) {
        query.name = new RegExp(search, 'i'); // Case-insensitive search
      }
  
      const products = await Product.find(query).skip(startIndex).limit(limit);
      const totalProducts = await Product.countDocuments(query);
  
      
      const unit = await Unit.find();
  
      res.render('pages/shop-grid', { 
        products, 
        category, 
        totalProducts, 
        page, 
        limit, 
        sub, 
        subid, 
        categoryid, 
        categoryname, 
        unit,
        isLoggedIn, wishcount, cartcount, cartProducts 
      });
    } catch (error) {
      console.error('Error getting shop grid page data:', error);
      res.status(500).render('error', { error: 'Failed to get shop grid page data' });
    }
  };

exports.contact = async (req, res) => {  
    const { isLoggedIn, wishcount, cartcount, cartProducts , category} = res.locals.navbarData || {};
      res.render('pages/contact',{isLoggedIn, wishcount, cartcount, cartProducts,category });
  };


module.exports = exports;
