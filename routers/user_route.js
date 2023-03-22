const express=require('express');
const user_route=express();
const session=require("express-session");
const userController=require('../controllers/userController')
const coupounController = require('../controllers/coupounController');
const bodyParser= require('body-parser')
const config=require('../config/config')
const userAuth=require('../middleware/userAuth')



user_route.use(session({secret:config.sessionSecret,
saveUninitialized:true,
resave:false}))

user_route.set('view engine','ejs');
user_route.set('views','./views/users');

// ---------------------------------
user_route.get('/',userAuth.isLogOut, userController.landPage);
user_route.get('/login',userAuth.isLogOut, userController.loginPage);
user_route.get('/signup',userAuth.isLogOut, userController.signupPage);
user_route.post('/signup',userController.insertUser);
user_route.get('/verify',userController.verifyMail)
user_route.post('/login',userController.verifyLogin);
user_route.get('/resend',userController.resendOtp)
user_route.get('/home',userAuth.isLogin,userController.landPage)
user_route.post('/otp',userController.verifyOtp);
user_route.get('/forget',userAuth.isLogOut,userController.forgetpage)
user_route.post('/forget',userController.forgetVerify)
user_route.get('/forget-password',userAuth.isLogOut,userController.forgetPasswordLoad)
user_route.post('/forget-password',userController.resetPassword)
// view Details Section
user_route.get('/view_details',userController.viewDetails)
// cart Section
user_route.get('/addToCart',userController.addToCart)
// cart Page
user_route.get('/cartPage',userAuth.isLogin,userController.cartPage)
// remove Cart Item
user_route.get('/removeCartItem',userAuth.isLogin,userController.removeCart)

//Change product quantity cart page
user_route.post('/change-product-quantity',userController.changeQuantity)


// Shope Page Section
user_route.get('/shope',userController.shopePage)


// Proceed To CheckOut
user_route.get('/checkOut',userAuth.isLogin,userController.checkOut)
// Address Posting CheckOut
// user_route.post('/checkOut',userController.addressLoad)
// *********


// Manage User Address
user_route.get('/manageAddress',userAuth.isLogin,userController.manageAddress)
// Update user Address
user_route.get('/updateAddress',userAuth.isLogin,userController.updateAddress)
user_route.post('/updateAddress',userController.updateLoad)
// Delete Address Of User
user_route.get('/deleteAddress',userAuth.isLogin,userController.deleteUser)
// User Profile Page
user_route.get('/profile',userAuth.isLogin,userController.profile)
// Add New Adress
user_route.get('/addNewAddress',userAuth.isLogin,userController.addNewAddress)
user_route.post('/addNewAddress',userAuth.isLogin,userController.addNewAddressLoad)

// Order Details Posting (loading) shipping Address loading for shipping 
user_route.post('/orderDetails',userController.orderDetails)
// Shipping Page Section -- Order Confirmation
user_route.get('/shipping',userAuth.isLogin,userController.shipping)
// verify Payment -- Online Payment 
user_route.post('/verifyPayment',userAuth.isLogin,userController.verifyPayment)
// user seeing the order list 
user_route.get('/seeOrder',userAuth.isLogin,userController.seeOrder)
// user view Details of Order after ordered 
user_route.get('/orderDetail',userAuth.isLogin,userController.orderDetail)
// order Cancel from coustemer
user_route.post('/cancelOrder',userAuth.isLogin,userController.cancelOrder)
// return Order by coustemer
user_route.post('/returnOrder',userAuth.isLogin,userController.returnOrder)



//Whish List Starting
user_route.get('/wishlistPage',userAuth.isLogin,userController.wishlistPage)
user_route.get('/addToWishList',userAuth.isLogin,userController.addToWishList)
user_route.get('/removeWishList',userAuth.isLogin,userController.removeWishList)

//Apply the Coupoun Code
user_route.post('/couponCodeApply',coupounController.coupounCodeApply)


// logout
user_route.get('/logout',userAuth.isLogin,userController.logoutpage)

module.exports=user_route;
