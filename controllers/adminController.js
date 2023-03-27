const User = require('../models/userModel');
const Product = require('../models/product')
const Catogery = require('../models/product_category')
const Order = require('../models/order')
const Coupon = require('../models/coupon')
const Inventory = require('../models/product_inventory')
const bcrypt = require('bcrypt');
const { query } = require('express');

const excelJS = require('exceljs')

//bcrypt password secure 
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash;

    } catch (error) {
        console.log(error.messege);
        console.log("secure Password section");
        res.render('cacheHandle')
    }
}

//Login Page of Admin
const loginPage = async (req, res) => {
    try {
        res.render('login')

    } catch (error) {
        console.log(error.messege);
        console.log("admin login section");
        res.render('cacheHandle')
    }
}

//verify Login
const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const adminData = await User.findOne({ email: email })
        if (adminData) {
            const passworMatch = await bcrypt.compare(password, adminData.password)
            if (passworMatch) {
                if (adminData.isAdmin === 0) {
                    res.render('login', { messege1: "Invalid User Or Password" })
                } else {
                    req.session.admin_id = adminData._id
                    res.redirect('/admin/home')


                }
            } else {
                res.render('login', { messege1: "Invalid user Or Password" })
            }
        } else {
            res.render('login', { messege1: "Invalid user Or Password" })
        }

    } catch (error) {
        console.log(error.messege);
        console.log("admin verify login section");
        res.render('cacheHandle')
    }
}

//admin home page section
const homepage = async (req, res) => {
    try {
        let todayDate = new Date().toLocaleDateString()
        // total orders
        let totalOrdersCount = (await Order.find({})).length
        // total Deliverd
        let totalDeliverd = (await Order.find({ status: "deliverd" })).length
        // total Product
        let totalProduct = (await Product.find({})).length
        // total Category
        let totalCategory = (await Catogery.find({})).length
        // total Users
        let totalUsers = (await User.find({})).length
        // total Coupoun
        let totalCoupoun = (await Coupon.find({})).length
        // recent Sales
        let recentSales = await Order.find({}).sort({ createdDate: -1 })


        res.render('home', {
            totalOrdersCount,
            totalDeliverd,
            totalProduct,
            totalCategory,
            totalUsers,
            totalCoupoun,
            recentSales
        })
    } catch (error) {
        console.log(error.messege);
        console.log("admin home page section ");
        res.render('cacheHandle')
    }
}
//  Sales Report filtering (dashboard-ajax calling)
const salesFilter = async (req, res) => {
    try {
        const start = req.body.start
        const end = req.body.end
        const orderData = await Order.find({ status: "deliverd", createdDate: { $gte: start, $lte: end } }).sort({ createdDate: 'desc' })
        res.json({ orderData })
    } catch (error) {
        console.log(error.messege);
        console.log("sales Report in dashboard -- section");
        res.render('cacheHandle')
    }
}
// export seles report to excel File
const exportSales = async (req, res) => {
    try {

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report')

        worksheet.columns = [

            { header: "Date", key: "createdDate" },
            { header: "Order Id", key: "id" },
            { header: "Coustemet", key: "customer" },
            { header: "Amount", key: "subTotal" },
            { header: "Payment Method", key: "paymentMethod" },
            { header: "Payment Status", key: "paymentStatus" },
            { header: "Order Status", key: "orderStatus" },

        ];

        const start = req.body.start;
        const end = req.body.end;
        const orderData = await Order.find({ status: "deliverd", createdDate: { $gte: start, $lte: end } }).sort({ createdDate: 'desc' })


        for (let i = 0; i < orderData.length; i++) {
            worksheet.addRow({
                createdDate: orderData[i].
                    createdDate.toLocaleDateString(), id: orderData[i]._id,
                customer: orderData[i].customer.name,
                subTotal: orderData[i].subTotal, paymentMethod: orderData[i].paymentMethod,
                paymentStatus: orderData[i].paymentStatus, orderStatus: orderData[i].status
            });
        }

        res.setHeader(
            "content-Type",
            "application/vnd.openxmlformates-officedocument.spreadsheatml.sheet"
        )

        res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx')

        return workbook.xlsx.write(res).then(() => {
            res.status(200);
        })


    } catch (error) {
        console.log(error.messege);
        console.log("export sales to excel section");
        res.render('cacheHandle')
    }
}


//User Management Section
const userManagement = async (req, res) => {
    try {

        const user = await User.find()
        res.render('userManagement', { user })

    } catch (error) {
        console.log(messege.error);
        console.log("User Management Section");
        res.render('cacheHandle')
    }
}

//block Check of User
const blockCheck = async (req, res) => {
    try {
        if (req.session.user_id) {
            req.session.destroy();
        }
        const userId = await req.query.id;
        const userData = await User.findOne({ _id: userId })
        const value = userData.is_blocked;
        if (value == 0) {
            const userUpdate = await User.findByIdAndUpdate({ _id: userId }, { $set: { is_blocked: 1 } })
            const user = await User.find()
            res.render('userManagement', { user })
            // res.redirect('/admin/userManagement')
        } else {
            const userUpdate = await User.findByIdAndUpdate({ _id: userId }, { $set: { is_blocked: 0 } })
            const user = await User.find()
            res.render('userManagement', { user })
        }


    } catch (error) {
        console.log(error.messege);
        console.log("Block check User");
        res.render('cacheHandle')
    }
}

// ----------------------------
//Category Management
const categoryManagement = async (req, res) => {
    try {
        const categoryDetail = await Catogery.find({ is_delete: false })
        res.render('categoryManagement', { categoryDetail })


    } catch (error) {
        console.log(error.messege);
        console.log("User Management Section");
        res.render('cacheHandle')
    }
}


// Add Catogery Page
const CatogeryPage = async (req, res) => {
    try {
        res.render('addCatogery', { messege: "" })
    } catch (error) {
        console.log(error.messege);
        console.log(" Add Catogery Section");
        res.render('cacheHandle')
    }
}
// loadCatogery-- posting category to database
const loadCatogery = async (req, res) => {
    try {
        const name = req.body.name;

        const categoryDetail = await Catogery.findOne({ name: { $regex: '.*' + name + '.*', $options: 'i' } })

        if (categoryDetail) {
            if (categoryDetail.is_delete) {
                await Catogery.findOneAndUpdate({ name: name }, { $set: { is_delete: false } })
                res.render('addCatogery', { messege: "Successfully Created" })
            } else {
                res.render('addCatogery', { messege: "Already Created This Category" })
            }
        }
        else {
            const category = new Catogery({
                name: req.body.name,
                description: req.body.description
            })
            const local = await category.save()
            res.render('addCatogery', { messege: "Successfully Created" })
        }
    } catch (error) {
        console.log(error.messege);
        console.log("Load Category Section");
        res.render('cacheHandle')
    }
}
// deleteCategory
const deleteCategory = async (req, res) => {
    try {
        const id = await req.query.id;
        const product = await Product.find({ category: id })
        if (product) { } else {
            await Catogery.findByIdAndUpdate({ _id: id }, { $set: { is_delete: true } })
        }

        res.redirect('/admin/category')

    } catch (error) {
        console.log(error.messege);
        console.log("Delete Category Section");
        res.render('cacheHandle')
    }
}
//Update Category get 
const updateCategory = async (req, res) => {
    try {
        const id = await req.query.id;
        const categoryData = await Catogery.findOne({ _id: id })
        if (categoryData) {
            res.render('updateCategory', { categoryData })
        }
    } catch (error) {
        console.log(error.messege);
        console.log("update Category Section");
        res.render('cacheHandle')
    }
}
// update category Load Post
const categoryLoad = async (req, res) => {
    try {
        const id = await req.body.id;
        const data = await Catogery.find({ _id: id })
        const categoryData = await Catogery.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, description: req.body.description } })
        console.log(categoryData);
        res.redirect('/admin/updateCategory')


    } catch (error) {
        console.log(error.messege);
        console.log("update category Loading Post section");
        res.render('cacheHandle')
    }
}

// ---------------------------------------------
//product Management Section
const productManagement = async (req, res) => {
    try {
        const product = await Product.find({ is_delete: false }).populate('category')
        res.render('productManagement', { product })

    }
    catch (error) {
        console.log(error.messege);
        console.log("product Management Section");
        res.render('cacheHandle')
    }
}

//prodect Page section 
const prodectPage = async (req, res) => {
    try {
        const local = await Catogery.find({ is_delete: false })
        res.render('addProdect', { local })
    } catch (error) {
        console.log(error.messege);
        console.log("admin prodectPagte section");
        res.render('cacheHandle')
    }
}

// Load Product 
const loadProduct = async (req, res) => {
    try {
        const name = req.body.name;
        const productDetail = await Product.findOne({ name: { $regex: '.*' + name + '.*', $options: 'i' } })


        if (productDetail) {

            if (productDetail.is_delete) {

                await Product.findOneAndUpdate({ name: name }, { $set: { is_delete: false } })
                res.redirect('/admin/addProdect')
            } else {
                res.redirect('/admin/addProdect')
            }
        } else {

            let files = []
            const imageUpload = await (function () {
                for (let i = 0; i < req.files.length; i++) {
                    files[i] = req.files[i].filename
                }
                return files;
            })()


            const prod = new Product({
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
                category: req.body.category,
                stock: req.body.stock,
                image: imageUpload
            })

            const loc = await prod.save()
            res.redirect('/admin/addProdect')
        }
    } catch (error) {
        console.log(error.messege);
        console.log("Load Product Section");
        res.render('cacheHandle')
    }
}


// Delete Product
const deleteProduct = async (req, res) => {
    try {
        const id = req.query.id;
        await Product.findByIdAndUpdate({ _id: id }, { $set: { is_delete: true } })

        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.messege);
        console.log("delete Product section");
        res.render('cacheHandle')
    }
}
// Update Product
const updateProduct = async (req, res) => {
    try {
        const id = req.query.id;
        const productData = await Product.findOne({ _id: id })
        const local = await Catogery.find();
        res.render('updateProduct', { productData, local })
    } catch (error) {
        console.log(error.messege);
        console.log("update Product Section");
        res.render('cacheHandle')
    }
}
//updated Product loading (post)
const updateProductLoad = async (req, res) => {
    try {
        // -----------------------------
        let files = []
        const imageUpload = await (function () {
            for (let i = 0; i < req.files.length; i++) {
                files[i] = req.files[i].filename
            }
            return files;
        })()
        // ---------------------------
        if(req.files.length > 0){
            const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock, image: imageUpload } })
        }else{
            const productData = await Product.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, description: req.body.description, price: req.body.price, stock: req.body.stock,  } })
        }
        
        // ,image:req.file.filename
        res.redirect('/admin/product')
    } catch (error) {
        console.log(error.messege);
        console.log("updated Product section Post");
        res.render('cacheHandle')
    }
}
// Add New Image Section
const addNewImage = async (req, res) => {
    try {
        const id = req.query.id
        res.render('addNewImage', { id })
    } catch (error) {
        console.log(error.messege);
        console.log("Add New Image Section");
        res.render('cacheHandle')
    }
}
// Add New Image Load
const addNewImageLoad = async (req, res) => {
    try {
        
        let files = []
        const imageUpload = await (function () {
            for (let i = 0; i < req.files.length; i++) {
                files = req.files[i].filename
            }
            return files;
        })()

        
        const add = await Product.findByIdAndUpdate(
            { _id: req.query.id },
            { $push: { image: imageUpload } }  
         )
         res.redirect('/admin/product')
        

    } catch (error) {
        console.log(error.messege);
        console.log("add New Image Section");
        res.render('cacheHandle')

    }
}
// Order Management Section
const orderManagement = async (req, res) => {
    try {

        const order = await Order.find({}).sort({createdDate:-1}).populate('user')
        res.render('orderManagement', { order })
    } catch (error) {
        console.log(error.messege);
        console.log("order Management section");
        res.render('cacheHandle')

    }
}

// Order Details Section
const orderDetails = async (req, res) => {
    try {

        const order = await Order.findById({ _id: req.query.id })
        let products = []
        for (let i = 0; i < order.product.length; i++) {
            products[i] = await Product.findById({ _id: order.product[i].productId })
        }

        res.render('orderDetails', { order, products })

    } catch (error) {
        console.log(error.messege);
        console.log("Order Details SEction");
        res.render('cacheHandle')
    }
}

//  order Details Changing Post Loading( pending to fullfill  ordered to deliverd)
const statusChangingLoad = async (req, res) => {
    try {

        console.log(req.session.admin_id);
        const order = await Order.updateMany({ _id: req.query.id }, { $set: { paymentStatus: req.body.paymentStatus, status: req.body.orderStatus } })


        res.redirect('/admin/orderManagement')
    } catch (error) {
        console.log(error.messege);
        console.log("order Details Posting Section");
        res.render('cacheHandle')

    }
}

// Admin LogOUt Page Section
const logoutpage = async (req, res) => {
    try {
        // req.session.destroy();
        req.session.admin_id = ""
        res.redirect('/admin')
    } catch (error) {
        console.log(error.messege);
        console.log("Admin Logout Section");
        res.render('cacheHandle')
    }
}



module.exports = {
    loginPage, verifyLogin, CatogeryPage, loadCatogery, prodectPage, loadProduct, homepage, logoutpage
    , userManagement, blockCheck, categoryManagement, deleteCategory, updateCategory, categoryLoad, productManagement
    , deleteProduct, updateProduct, updateProductLoad, orderManagement, orderDetails, statusChangingLoad, salesFilter,
    exportSales, addNewImage, addNewImageLoad
}