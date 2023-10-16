const express = require('express');
const session = require("express-session");
// const config = require('../config/config')
const adminAuth = require('../middleware/adminAuth')
const bodyParser = require('body-parser')
const path = require('path');
const adminController = require('../controllers/adminController');
const coupounController = require('../controllers/coupounController');
// const upload = require('../config/multerConfig')

// -------------------from config 
const multer=require("multer")
// const path = require('path');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
       cb(null,path.join(__dirname, '../public/productimages'))
    },
    filename:function(req,file,cb){
      const name=Date.now()+"-"+file.originalname;
      cb(null,name);
    }
});
const upload = multer({storage:storage})

// --------

const admin_route = express();

admin_route.use(session({
  secret: process.env.SESSIONSECRET
  , saveUninitialized: true,
  resave: false
}))



admin_route.set('view engine', 'ejs');
admin_route.set('views', './views/admin');

// ---------------------------------
admin_route.get('/',adminAuth.isLogOut, adminController.loginPage)
admin_route.post('/', adminController.verifyLogin)
admin_route.get('/home',adminAuth.isLogin, adminController.homepage)
// sales report (dashboard -- ajax calling)
admin_route.post('/salesFilter',adminAuth.isLogin,adminController.salesFilter)
admin_route.post('/export-sales',adminAuth.isLogin,adminController.exportSales)
// user Management
admin_route.get('/userManagement',adminAuth.isLogin, adminController.userManagement)
admin_route.get('/blockUser',adminAuth.isLogin,  adminController.blockCheck)
//category Management
admin_route.get('/category',adminAuth.isLogin, adminController.categoryManagement)
admin_route.get('/addCategory',adminAuth.isLogin, adminController.CatogeryPage)
admin_route.post('/addCategory', adminController.loadCatogery)
admin_route.get('/deleteCategory',adminAuth.isLogin, adminController.deleteCategory)
admin_route.get('/updateCategory',adminAuth.isLogin, adminController.updateCategory)
admin_route.post('/updateCategory', adminController.categoryLoad)
//Product Management
admin_route.get('/product',adminAuth.isLogin, adminController.productManagement)
admin_route.get('/addProdect',adminAuth.isLogin, adminController.prodectPage)
admin_route.post('/addProdect', upload.array('image', 5), adminController.loadProduct)
admin_route.get('/deleteProduct',adminAuth.isLogin, adminController.deleteProduct)
admin_route.get('/updateProduct',adminAuth.isLogin, adminController.updateProduct)
admin_route.post('/updateProduct', upload.array('image', 5), adminController.updateProductLoad)
admin_route.get('/addNewImage',adminAuth.isLogin,adminController.addNewImage)
admin_route.post('/addNewImage',upload.array('image', 5),adminAuth.isLogin,adminController.addNewImageLoad)
// Order Management
admin_route.get('/orderManagement',adminAuth.isLogin, adminController.orderManagement)
admin_route.get('/orderDetails',adminAuth.isLogin, adminController.orderDetails)
//changing order details (pending to full fill---orderd to deliverd)
admin_route.post('/orderDetails', adminController.statusChangingLoad)


// coupoun Management 
admin_route.get('/coupounManagement',adminAuth.isLogin, coupounController.coupounManagement)
admin_route.get('/addCoupoun',adminAuth.isLogin,coupounController.addCoupoun)
admin_route.post('/addCoupoun',coupounController.coupounLoad)
admin_route.get('/updateCoupoun',adminAuth.isLogin,coupounController.updateCoupoun)
admin_route.post('/updateCoupoun',coupounController.updateCoupounLoad)
admin_route.get('/deleteCoupoun',adminAuth.isLogin,coupounController.deleteCoupoun)


// logout 
admin_route.get('/logout',adminAuth.isLogin, adminController.logoutpage)



module.exports = admin_route;