const express = require('express');
const router = express.Router();
const mainController = require('../controllers/maincontroller');
const auth = require('../controllers/authController');
const pages = require('../controllers/pagesController');
const user = require('../controllers/userController');
const adminconttroller = require('../controllers/adminconttroller');
const { checkAuth } = require('../middlewares/checkAuth');
const multer  = require('multer');
const upload = multer({ dest: 'public/upload/' });



router.get('/', pages.index); // Index page
router.get('/index', pages.index);
router.get('/about', pages.about);
router.get('/shop', pages.shop);
router.get('/contact', pages.contact);

// pages routes require auth
router.get('/wishlist',checkAuth, user.shopWishlist);
router.get('/shop-cart',checkAuth, user.shopCart);
router.get('/shop-checkout',checkAuth, user.shopCheckout);


router.get('/pages/shop-grid-3-column', mainController.shopGrid3Column);
router.get('/pages/shop-list', mainController.shopList);
router.get('/pages/shop-filter', mainController.shopFilter);
router.get('/pages/shop-fullwidth', mainController.shopFullwidth);
router.get('/pages/shop-single', mainController.shopSingle);

router.get('/invoice/:invoiceId', mainController.viewInvoice);
router.get('/pages/shop-single-2', mainController.shopSingle2);

router.post('/order', mainController.order);
router.post('/cancelorder', mainController.cancelorder);
router.get('/pages/store-list', mainController.storeList);
router.get('/pages/store-grid', mainController.storeGrid);
router.get('/pages/store-single', mainController.storeSingle);
router.get('/pages/blog', mainController.blog);
router.get('/pages/blog-single', mainController.blogSingle);
router.get('/pages/blog-category', mainController.blogCategory);
router.get('/404error', mainController.error404);


router.get('/signin', auth.signin);
router.get('/signup', auth.signup);
router.get('/forgot-password', auth.forgotPassword);
router.post('/forgotpass', auth.forgotpass);
router.post('/login', auth.login);
router.post('/register', auth.register);
router.post('/delete-account', auth.deleteAccount);
router.get('/logout', auth.logout);




router.get('/account-orders', checkAuth, user.accountOrders);
router.get('/account-settings', checkAuth, user.accountSettings);
router.post('/accountUpdate', checkAuth, user.accountUpdate);
router.get('/account-address', checkAuth, user.accountAddress);
router.get('/account-payment-method', checkAuth, user.accountPaymentMethod);
router.get('/account-notification', checkAuth, user.accountNotification);
router.get('/account-resetpass', checkAuth, user.accountresetpass);





router.post('/addtowishlist', checkAuth, mainController.addToWishlist);
router.post('/deleteFromWishlist', mainController.removeFromWishlist);
router.get('/removeFromCart/:productId', mainController.removeFromCart);
router.post('/addToCartlist', checkAuth, mainController.addToCart);

// Dashboard
// Create a new user
router.post('/users', adminconttroller.createUser);

// Get all users
router.get('/users', adminconttroller.getAllUsers);

// Get a single user by ID
router.get('/users/:id', adminconttroller.getUserById);

// Update a user by ID
router.put('/users/:id', adminconttroller.updateUserById);

// Delete a user by ID
router.delete('/users/:id', adminconttroller.deleteUserById);
router.get('/dashboard/index', adminconttroller.dashboardIndex);
router.get('/dashboard/products', adminconttroller.dashboardProducts);
router.get('/dashboard/categories', adminconttroller.dashboardCategories);
router.get('/dashboard/subcategories', adminconttroller.dashboardSubcategories);
router.get('/dashboard/order-list', adminconttroller.dashboardOrderList);
router.get('/dashboard/unit-list', adminconttroller.unitList);
router.get('/dashboard/order-single', adminconttroller.dashboardOrderSingle);
router.get('/order-single', adminconttroller.dashboardOrderSingle);
router.get('/dashboard/vendor-grid', adminconttroller.dashboardVendorGrid);
router.get('/dashboard/customers', adminconttroller.dashboardCustomers);
router.get('/dashboard/reviews', adminconttroller.dashboardReviews);
router.get('/dashboard/settings', adminconttroller.dashboardSettings);
router.post('/dashboard/settings/:id', adminconttroller.dashboardSettings);


router.get('/dashboard/addProduct',  checkAuth, adminconttroller.addProduct);
router.post('/dashboard/addProduct', upload.single('image'), checkAuth, adminconttroller.addProduct);
router.get('/dashboard/editProduct',  checkAuth, adminconttroller.editProduct);
router.post('/dashboard/editProduct',  upload.single('image'), checkAuth, adminconttroller.editProduct);
router.get('/dashboard/deleteProduct/:id',  checkAuth, adminconttroller.deleteProduct);

router.get('/dashboard/addCategory', checkAuth, adminconttroller.addCategory);
router.post('/dashboard/addCategory', upload.single('image'),checkAuth, adminconttroller.addCategory);
router.get('/dashboard/editCategory',  checkAuth, adminconttroller.editCategory);
router.post('/dashboard/editCategory', upload.single('image'), checkAuth, adminconttroller.editCategory);
router.get('/dashboard/deleteCategory/:id',  checkAuth, adminconttroller.deleteCategory);

router.get('/dashboard/addsubCategory',  checkAuth, adminconttroller.addSubcategory);
router.post('/dashboard/addsubCategory',  upload.single('image'),checkAuth, adminconttroller.addSubcategory);
router.get('/dashboard/editsubCategory', checkAuth, adminconttroller.editSubcategory);
router.post('/dashboard/editsubCategory',  upload.single('image') , checkAuth, adminconttroller.editSubcategory);
router.get('/dashboard/deletesubCategory',  checkAuth, adminconttroller.deleteSubcategory);
router.post('/dashboard/deletesubCategory',  checkAuth, adminconttroller.deleteSubcategory);


router.get('/dashboard/addUnit',  checkAuth, adminconttroller.addUnit);
router.post('/dashboard/addUnit',  checkAuth, adminconttroller.addUnit);
router.get('/dashboard/deleteUnit/:id',  checkAuth, adminconttroller.deleteUnit);
router.get('/dashboard/editUnit', adminconttroller.editUnit);
router.post('/dashboard/editUnit', adminconttroller.editUnit);


router.get('/dashboard/editorder',  checkAuth, adminconttroller.editorder);
router.post('/dashboard/editorder',  checkAuth, adminconttroller.editorder);
router.get('/dashboard/deleteorder/:id',  checkAuth, adminconttroller.deleteorder);
// Route to handle updating cart quantity
router.post('/updateCartQuantity',mainController.updateCartQuantity );

module.exports = router;
