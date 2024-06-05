const User = require('../models/user');
const Product = require('../models/products');
const Category = require('../models/category');
const Unit = require('../models/units');
const Order = require('../models/orders');
const Message = require('../models/message');
const { checkAuth } = require('../middlewares/checkAuth');
const { order } = require('./maincontroller');
const mailer = require('./emailsender');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const Settings = require('../models/setting');

const decodeToken = (token) => {
  try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      return decodedToken.data;
  } catch (error) {
      console.error('Error decoding token:', error);
      return null;
  }
};

exports.dashboardIndex = async (req, res) => {
  checkAuth(req, res, async () => {
    try {
      // Fetch relevant data
      const orders = await Order.find();
      const [users, completedOrders, cancelledOrders, products, categories] = await Promise.all([
        User.find({ user_type: 'user' }).count(), // Count active users
        Order.find({ payment_status: 'completed' }).count(), // Count completed orders
        Order.find({ payment_status: 'cancelled' }).count(), // Count cancelled orders
        Product.find().count(), // Count products (assuming Product model exists)
        // Assuming Category model exists, adjust the query if needed
        Category.find().countDocuments(), // Count categories (including subcategories if nested)
      ]);

      const totalPrice = (await Order.find({ payment_status: 'completed' })).reduce(
        (acc, order) => acc + order.total_price,
        0
      ); // Calculate total earnings

      res.render('dashboard/index', {
        totalActiveUsers: users,
        totalCompletedOrders: completedOrders,
        totalCancelledOrders: cancelledOrders,
        totalProducts: products,
        totalCategoriesAndSubcategories: categories, // Assuming categories include subcategories
        totalPrice,
        user: await User.findOne({ email: decodeToken(req.cookies.token).email }),orders
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).render('error', { error: 'Failed to fetch data' });
    }
  });
};





exports.dashboardProducts = async (req, res) => {
  checkAuth(req, res, async () => {  
  try {
    const user = await User.findOne({email:decodeToken(req.cookies.token).email});
        const products = await Product.find();
        res.render('dashboard/products', {
           products: products,
           user: await User.findOne({ email: decodeToken(req.cookies.token).email }) 
        });
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).render('error', { error: 'Failed to get products' });
    }
  });
};


exports.dashboardCategories = async (req, res) => {
  checkAuth(req, res, async () => {  
  try {
        const category = await Category.find(); // Use Category.find() instead of Categorys.find()
        res.render('dashboard/category', { category: category,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) }); // Pass the fetched categories to the template with the variable name "category"
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).render('error', { error: 'Failed to get categories' });
    }
  });
};
exports.dashboardSubcategories = async (req, res) => {
  checkAuth(req, res, async () => {  
  try {
        const sub = req.query.sub; // Get the unit ID from the query parameter
        const category = sub ? await Category.find({ title : sub }) : await Category.find(); 
        res.render('dashboard/subcategories', { category: category,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
    } catch (error) {
        console.error('Error getting subcategories:', error);
        res.status(500).render('error', { error: 'Failed to get subcategories' });
    }
  });
};


exports.unitList = async (req, res) => {
  checkAuth(req, res, async () => {  
  try {
        const units = await Unit.find(); // Assuming you are using Mongoose to fetch units
        res.render('dashboard/unit-list', { units: units,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) }); // Pass the fetched units to the template
    } catch (error) {
        console.error('Error getting units:', error);
        res.status(500).render('error', { error: 'Failed to get units' });
    }
  });
};




exports.dashboardOrderList = async (req, res) => {
  checkAuth(req, res, async () => {  
  try {
        const orders = await Order.find(); // Assuming you are using Mongoose to fetch orders
        res.render('dashboard/order-list', { orders: orders,user: await User.findOne({ email: decodeToken(req.cookies.token).email })  }); // Pass the fetched orders to the template
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).render('error', { error: 'Failed to get orders' });
    }
  });
};


exports.dashboardOrderSingle = (req, res) => {
  checkAuth(req, res, async () => {
    res.render('dashboard/order-single');
  });
};

// product
exports.addProduct = (req, res) => {
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { name, category, subcategory, units, details, availability, price, discounted_price } = req.body;
        const image = req.file ? req.file.filename : null;

        // Create a new product instance
        const newProduct = new Product({
          name,
          category,
          subcategory,
          units,
          details,
          image,
          availability,
          price,
          discounted_price,
        });

        // Save the new product to the database
        await newProduct.save();

        // Log success message
        console.log('New product added:', newProduct);

        // Redirect to the products page
        res.redirect('/dashboard/products');
      } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
      }
    } else {
      // If it's a GET request, render the form to add a new product
      const category = await Category.find();
      const product = await Product.find();
      const unit = await Unit.find();
      res.render('dashboard/embedProduct', { product,units: unit, category: category,type:'add',user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
    }
  });
};

exports.editProduct = async (req, res) => {
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      const productId = req.query.id;
      const { name, category, subcategory, units, details, price, discounted_price, availability } = req.body;
      const image = req.file ? req.file.filename : null;

      try {
        // Find the product by ID
        const product = await Product.findById(productId);

        if (!product) {
          return res.status(404).json({ error: 'Product not found' });
        }

        // Check if the image has changed
        if (image && image !== product.image) {
          const imagePath = path.join(__dirname, '../public/upload/', product.image);
            // Check if the image file exists before attempting to delete
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                console.log('Image file deleted successfully');
            }
          product.image = image;
        }

        // Update product details
        product.name = name;
        product.category = category;
        product.subcategory = subcategory;
        product.units = units;
        product.details = details;
        product.price = price;
        product.discounted_price = discounted_price;
        product.availability = availability === 'true';

        // Save the updated product to the database
        const updatedProduct = await product.save();

        console.log('Updated product:', updatedProduct);

        // Redirect to the products page
        res.redirect('/dashboard/products');
      } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
      }
    } else {
      const productId = req.query.id;
      try {
        // Fetch the product and related data for rendering the edit form
        const product = await Product.findById(productId);
        const categories = await Category.find();
        const units = await Unit.find();

        res.render('dashboard/embedProduct', { product, categories,category:categories, units, type: 'edit',user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
      } catch (error) {
        console.error('Error fetching product for edit:', error);
        res.status(500).json({ error: 'Failed to fetch product for edit' });
      }
    }
  });
};


exports.deleteProduct = (req, res) => {
  checkAuth(req, res, async () => {
    try {
      const productId = req.params.id;

      // Use Mongoose to find and remove the product by its ID
      const deletedproduct =  await Product.findByIdAndDelete(productId);
      // Delete associated image file
      if (deletedproduct.image) {
        const imagePath = path.join(__dirname, '../public/upload/', deletedproduct.image);

        // Check if the image file exists before attempting to delete
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Image file deleted successfully');
        }
    }

      // Redirect back to the dashboard or any other appropriate route
      res.redirect('/dashboard/products');

      // Optionally, you can also send a success message or handle other operations
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });
};



// category


exports.addCategory = (req, res) => {
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;
    
        const newCategory = new Category({
          title,
          description,
          images: image
        });
    
        await newCategory.save();
        console.log('New category added:', newCategory);
        res.redirect('/dashboard/categories');
      } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Failed to add category' });
      }
    } else {
      // If it's a GET request, render the form to add a new category
      const categories = await Category.find();
      res.render('dashboard/embedCategory', { categories,type:'add',user: await User.findOne({ email: decodeToken(req.cookies.token).email })});
    }
  });
};
exports.editCategory = async (req, res) => {
  const categoryId = req.query.id; // Extract categoryId from the query parameters
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { title, description } = req.body;
        const image = req.file ? req.file.filename : null;
        const category = await Category.findById(categoryId);
        if (!category) {
          console.log('Category not found');
          return res.status(404).json({ error: 'Category not found' });
        }
        // Check if the image has changed
        if (image && image !== category.images) {
          const imagePath = path.join(__dirname, '../public/upload/', category.images);

        // Check if the image file exists before attempting to delete
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Image file deleted successfully');
        }
          category.images = image;
        }

        // Update category fields
        category.title = title;
        category.description = description;

        // Save the updated category to the database
        const updatedCategory = await category.save();

        console.log('Category updated:', updatedCategory);
        res.redirect('/dashboard/categories');
      } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Failed to update category' });
      }
    } else {
      // Handle GET request (rendering the form)
      try {
        const category = await Category.findById(categoryId);
        if (!category) {
          console.log('Category not found');
          return res.status(404).json({ error: 'Category not found' });
        }
        res.render('dashboard/embedCategory', { categories:category, type: 'edit',user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
      } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Failed to fetch category for edit' });
      }
    }
  });
};

const path = require('path');
const fs = require('fs');

exports.deleteCategory = (req, res) => {
    checkAuth(req, res, async () => {
        try {
            const categoryId = req.params.id;

            // Use Mongoose to find and remove the category by its ID
            const deletedCategory = await Category.findByIdAndDelete(categoryId);

            if (!deletedCategory) {
                return res.status(404).json({ error: 'Category not found' });
            }

            // Delete associated image file
            if (deletedCategory.images) {
                const imagePath = path.join(__dirname, '../public/upload/', deletedCategory.images);

                // Check if the image file exists before attempting to delete
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                    console.log('Image file deleted successfully');
                }
            }

            // Redirect back to the dashboard or any other appropriate route
            res.redirect('/dashboard/categories');

            // Optionally, you can also send a success message or handle other operations
        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({ error: 'Failed to delete category' });
        }
    });
};



// Subcategory
function convertToIST(date) {
  // Get the current date/time in UTC
  const utcDate = new Date(date.toISOString());

  // Convert UTC to IST (add 5 hours and 30 minutes)
  const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000));

  return istDate;
}

exports.addSubcategory = async (req, res) => {
  checkAuth(req, res, async () => {
      if (req.method === 'POST') {
          try {
              const { cat_id, name, details } = req.body;
              const images = req.file ? req.file.filename : null;

              // Find the category by its ID
              const category = await Category.findById(cat_id);
              if (!category) {
                  return res.status(404).json({ error: 'Category not found' });
              }
              const newSubcategory = {
                  name,
                  details,
                  images, // Use 'images' field name (not 'image')
                  createdat: convertToIST(new Date()) // Assuming you want to set the creation date to now
              };

              // Push the new subcategory to the category's subcategory array
              category.subcategory.push(newSubcategory);

              // Save the updated category to the database
              await category.save();

              // Log success message
              console.log('New subcategory added:', newSubcategory);

              // Redirect to the dashboard or any other appropriate route
              res.redirect('/dashboard/subcategories');

          } catch (error) {
              console.error('Error adding subcategory:', error);
              res.status(500).json({ error: 'Failed to add subcategory' });
          }
      } else {
          try {
              // If it's a GET request, retrieve all categories from the database
              const categories = await Category.find();
              // Render the form to add a new subcategory, passing retrieved categories to the rendering engine
              res.render('dashboard/embedSubcategory', { subcategory:categories,categoryId:null, categories,category:categories, type: 'add',user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
          } catch (error) {
              console.error('Error fetching categories:', error);
              res.status(500).json({ error: 'Failed to fetch categories' });
          }
      }
  });
};

exports.editSubcategory = async (req, res) => {
  const { categoryId, subcategoryId } = req.query;
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { name, details } = req.body;
        const images = req.file ? req.file.filename : null; // Set images to filename if req.file exists
        
        // Find the category by ID
        const category = await Category.findById(categoryId);
    
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
    
        // Find the subcategory to update by its ID
        const subcategoryToUpdate = category.subcategory.id(subcategoryId);
    
        if (!subcategoryToUpdate) {
          return res.status(404).json({ error: 'Subcategory not found' });
        }
    
        // Update subcategory fields
        subcategoryToUpdate.name = name;
        subcategoryToUpdate.details = details;
        
        // Check if images are provided and they are different
        if (images && images !== subcategoryToUpdate.images) {
          const imagePath = path.join(__dirname, '../public/upload/', subcategoryToUpdate.images);

        // Check if the image file exists before attempting to delete
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            console.log('Image file deleted successfully');
        }
          subcategoryToUpdate.images = images;
        }
    
        // Save the updated category to the database
        await category.save();
    
        // Log success message
        console.log('Subcategory updated successfully:', subcategoryToUpdate);
    
        // Redirect to the dashboard or any other appropriate route
        res.redirect('/dashboard/subcategories');
    
      } catch (error) {
        console.error('Error updating subcategory:', error);
        res.status(500).json({ error: 'Failed to update subcategory' });
      }
    } else {
      const category = await Category.find();
      const categories = await Category.findById(categoryId);
      // Find the subcategory by its ID
      const subcategory = categories.subcategory.id(subcategoryId);
      res.render('dashboard/embedSubcategory', { subcategory, categoryId, type: 'edit',user: await User.findOne({ email: decodeToken(req.cookies.token).email }),category });
    }
  });
};


exports.deleteSubcategory = (req, res) => {
  checkAuth(req, res, async () => {
    const { categoryId, subcategoryId } = req.query;

    try {
      // Find the category by ID
      const category = await Category.findById(categoryId);

      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }

      // Find the index of the subcategory within the category's subcategory array
      const subcategoryIndex = category.subcategory.findIndex(sub => sub._id.toString() === subcategoryId);

      if (subcategoryIndex === -1) {
        return res.status(404).json({ error: 'Subcategory not found' });
      }

      // Retrieve the specific subcategory using the found index
      const foundSubcategory = category.subcategory[subcategoryIndex];

      // Remove the subcategory from the category's subcategory array
      category.subcategory.splice(subcategoryIndex, 1);

      // Save the updated category to the database
      await category.save();

      // Output the updated category (for debugging purposes)
      console.log('Updated Category:', category);

        // Log a success message
      console.log('Subcategory deleted successfully:', foundSubcategory);

      // Redirect to /dashboard/subcategories
      res.redirect('/dashboard/subcategories');


    } catch (error) {
      console.error('Error deleting subcategory:', error);
      res.status(500).json({ error: 'Failed to delete subcategory' });
    }
  });
};


// Unit

exports.addUnit = (req, res) => {
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { name } = req.body;

        // Create a new addSubcategory instance
        const newUnit = new Unit({
          name,
        });

        // Save the new Subcategory to the database
        await newUnit.save();

        // Log success message
        console.log('New Subcategory added:', newUnit);

        // Redirect to the dashboard or any other appropriate route
        res.redirect('/dashboard/unit-list');

      } catch (error) {
        console.error('Error adding unit:', error);
        res.status(500).json({ error: 'Failed to add unit' });
      }
    } else {
      const unit = await Unit.find();
      res.render('dashboard/embedUnit',{unit,type:'add',user: await User.findOne({ email: decodeToken(req.cookies.token).email })});
    }
  });
};

exports.editUnit = (req, res) => {
  checkAuth(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const unitId = req.query.id;
        const { name } = req.body;
        // Update the unit with the specified _id (unitId) in the Unit collection
        const updatedUnit = await Unit.findByIdAndUpdate(unitId, { name }, { new: true });
      
        if (!updatedUnit) {
          return res.status(404).json({ error: 'Unit not found' });
        }
        res.redirect('/dashboard/unit-list')
      
        // Unit was successfully updated
        // res.json({ message: 'Unit updated successfully', updatedUnit });
      } catch (error) {
        console.error('Error updating unit:', error);
        res.status(500).json({ error: 'Failed to update unit' });
      }
    }
    else {
      const unitId = req.query.id; // Get the unit ID from the query parameter
        const unit = unitId ? await Unit.findById(unitId) : null;
        res.render('dashboard/embedUnit', { unit,type:'edit',user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });    }
  });
};


exports.deleteUnit = (req, res) => {
  checkAuth(req, res, async () => {
    try {
      const unitId = req.params.id;

      // Use Mongoose to find and remove the Subcategory by its ID
      await Unit.findByIdAndDelete(unitId);

      // Redirect back to the dashboard or any other appropriate route
      res.redirect('/dashboard/unit-list');

      // Optionally, you can also send a success message or handle other operations
    } catch (error) {
      console.error('Error deleting unit :', error);
      res.status(500).json({ error: 'Failed to delete unit' });
    }
  });
};


exports.dashboardVendorGrid = (req, res) => {
    res.render('dashboard/vendor-grid');
};

exports.dashboardCustomers = async (req, res) => {
    try {
        const users = await User.find();
        res.render('dashboard/customers', { users: users,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

// controllers/dashboardController.js


exports.dashboardReviews = async (req, res) => {
    try {
        const reviews = await Message.find();
        res.render('dashboard/reviews', { reviews: reviews,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) }); // Ensure to pass reviews to the template
    } catch (error) {
        console.error('Error getting reviews:', error);
        res.status(500).render('error', { error: 'Failed to get reviews' });
    }
   
};
exports.dashboardSettings = async (req, res) => {
  if (req.method === 'POST') {
    try {
      // Extract data from the request body
      const {
        applicationName,
        contactNumber,
        email,
        address,
        serviceFee,
        deliveryCharges,
        service,
        host,
        port,
        secure,
        user,
        pass
      } = req.body;

      // Construct the update object
      const updateData = {};
      if (applicationName) updateData.applicationName = applicationName;
      if (contactNumber) updateData.contactNumber = contactNumber;
      if (email) updateData.email = email;
      if (address) updateData.address = address;
      if (serviceFee !== undefined) updateData.serviceFee = serviceFee;
      if (deliveryCharges !== undefined) updateData.deliveryCharges = deliveryCharges;
      if (service) updateData.service = service;
      if (host) updateData.host = host;
      if (port !== undefined) updateData.port = port;
      if (secure !== undefined) updateData.secure = secure === 'on'; 
      if (user) updateData.user = user;
      if (pass) updateData.pass = pass;

      // Update the settings document based on the provided _id
      await Settings.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });

      // Redirect or send a response
      res.redirect('/dashboard/settings');
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).render('error', { error: 'Failed to update settings' });
    }
  } else {
    try {
      const setting = await Settings.findOne().exec();
    const user = await User.findOne({ email: decodeToken(req.cookies.token).email }).exec();
      res.render('dashboard/settings', { type: 'edit', user: user, setting: setting });
    } catch (error) {
      console.error('Error getting settings:', error);
      res.status(500).render('error', { error: 'Failed to get settings' });
    }
  }
};


// Create a new user
exports.createUser = async (req, res) => {
    try {
      const { name, email, age } = req.body;
      const user = new User({ name, email, age });
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  };
  
  // Get all users
  exports.getAllUsers = async (req, res) => {
    try {
      const category = await Category.find();
      res.json(category);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  };
  
  // Get a single user by ID
  exports.getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  };
  
  // Update a user by ID
  exports.updateUserById = async (req, res) => {
    try {
      const { name, email, age } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { name, email, age }, { new: true });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  };
  
  // Delete a user by ID
  exports.deleteUserById = async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  };

  exports.deleteorder = (req, res) => {
    checkAuth(req, res, async () => {
      try {
        const Id = req.params.id;
  
        // Use Mongoose to find and remove the product by its ID
        await Order.findByIdAndDelete(Id);
  
        // Redirect back to the dashboard or any other appropriate route
        res.redirect('/dashboard/order-list');
  
        // Optionally, you can also send a success message or handle other operations
      } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
      }
    });
  };

  exports.editorder = async (req, res) => {
      try {
          if (req.method === 'POST') {
              const id = req.query.id;
              const { paymentstatus } = req.body;
              
              // Update the order's payment status based on the provided ID and payment status
              const order = await Order.findByIdAndUpdate(id, { payment_status: paymentstatus });
             if(paymentstatus == 'completed'){
              mailer(order.email, '', '', `Thank You ! ${order.name} 😊 For Your Order `, `<div class="container">
              <h1>Thank You ! <b> ${order.name} for ordering from Suresh Kirana Store.</b></h1>
              <p>We hope you have enjoyed our services ! Enjoy your Shopping at your Loved Store.<br>Your Order has been Delivered Successfully.  
              </p>
          </div>`);
             }
              // Redirect or send a response indicating success
              res.redirect('/dashboard/order-list');
          } else {
              const orderId = req.query.id; // Get the order ID from request parameters
  
              // Use Mongoose to find the order by its ID
              const order = await Order.findById(orderId);
  
              // Render the dashboard view with the order data for editing
              res.render('dashboard/embedorder', { order:order,user: await User.findOne({ email: decodeToken(req.cookies.token).email }) });
              // res.json(orderId);
          }
      } catch (error) {
          console.error('Error processing order:', error);
          res.status(500).json({ error: 'Failed to process order' });
      }
  };
  


module.exports = exports;

