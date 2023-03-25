const User = require('../models/userModel');
const Product = require('../models/product')
const Catogery = require('../models/product_category')
const Cart = require('../models/cart')
const Order = require('../models/order')
const WishList = require('../models/wishlist')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer');
const config = require('../config/config')
const randomString = require('randomstring');
const session = require('express-session');
const { ObjectId } = require('mongodb');
const { response } = require('../routers/user_route');
const { findByIdAndUpdate, findById } = require('../models/userModel');
const Razorpay = require('razorpay')
// ------------------ReazorPay instance Creation--------------
var instance = new Razorpay({
    key_id: 'rzp_test_xk0UsGPRImH9dr',
    key_secret: 'WqViuHHzlHMKTSXaNtaZGQs1',
});

// ---------------------------------
const { TWILIO_SERVICE_SID, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, {
    lazyLoading: true
});
// -------------------------------------------

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

// for Send Mail  verification
const sendVerifyMail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "for Veryfication Mail",
            // html: '<p> Hai' + name + ', Please Click Here to <a href="http://localhost:3000/verify?id=' + user_id + '"> Verify </a> Your Mail </p>'
            html: '<p> Hai' + name + ', Please Click Here to <a href="/verify?id=' + user_id + '"> Verify </a> Your Mail </p>'

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                console.log("Mail Transporter  in send Mail Section");
            } else {
                console.log("Email has been send:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.messages);
        console.log("Send Mail Section");
        res.render('cacheHandle')
    }
}

//for reset password Mail Sending
const sendResetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            tls: true,
            auth: {
                user: config.emailUser,
                pass: config.emailPassword
            }
        });

        const mailOptions = {
            from: config.emailUser,
            to: email,
            subject: "for Reset Password",
            html: '<p> Hai  ' + name + ', Please Click Here to <a href="http://localhost:3000/forget-password?token=' + token + '"> Reset </a> Your Password </p>'

        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                console.log("Mail Transporter  in send Mail Section");
            } else {
                console.log("Email has been send:-", info.response);
            }
        })
    } catch (error) {
        console.log(error.messages);
        console.log("Send Mail Section");
        res.render('cacheHandle')
    }
}

//Land Page
const landPage = async (req, res) => {
    try {

        // --------------cart item counting
        let count = 0; let wishCount
        const messege = req.session.user_id;
        const category = await Catogery.find({})
        let cartData = await Cart.findOne({ user: messege }).populate('product')
        let wishListData = await WishList.findOne({ user: messege }).populate('product')
        // ----------------
        if (cartData) {
            count = cartData.product.length
        } else {
            count = 0;
        }
        // -------------------------
        if (wishListData) {
            wishCount = wishListData.product.length
        } else {
            wishCount = 0;
        }
        // --------------------
        const product = await Product.find({ is_delete: false })


        if (messege) {
            res.render('landPage', {
                product, messege,
                count, wishCount, category
            });
        }
        else {
            res.render('landPage', {
                product, messege, category

            })
        }

    } catch (error) {
        console.log(error.messege);
        console.log("load register side");
        res.render('cacheHandle')
    }
}

//user Login Page
const loginPage = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.messege);
        console.log("login page side");
        res.render('cacheHandle')
    }
}

//Signup page - create new user
const signupPage = async (req, res) => {
    try {
        res.render('signup')
    } catch (error) {
        console.log(error.messege);
        console.log("signup page side");
        res.render('cacheHandle')
    }
}

// User Details
const insertUser = async (req, res) => {
    try {
        const checkone = await User.findOne({ email: req.body.email })
        const checktwo = await User.findOne({ phone: req.body.phone });

        if (checkone) {
            res.render('signup', { messege: "Mail already Registred " })
        } else if (checktwo) {
            res.render('signup', { messege: "MobileNumber  already Registred " })
        }
        else {
            // -----------------------
            req.session.signupData = req.body;
            const phone = req.body.phone;
            const otpResponse = await client.verify.
                v2.services(TWILIO_SERVICE_SID)
                .verifications.create({
                    to: phone,
                    channel: "sms",
                })

            res.render('otp', { message: req.body.phone })
        }

    } catch (error) {
        console.log(error.messege);
        console.log("inset user section ");
        res.render('cacheHandle')
    }
}
// Resend Otp
const resendOtp = async (req, res) => {
    try {
        const phone = req.session.signupData.phone;
        const otpResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verifications.create({
                to: phone,
                channel: "sms",
            })

        res.render('otp', { message: req.body.phone })
    } catch (error) {
        console.log(error.message);
        console.log("resend Otp section");
        res.render('cacheHandle')
    }
}

//verify Otp 
const verifyOtp = async (req, res) => {
    const otp = req.body.otp;
    const phone = req.session.signupData.phone;
    console.log(otp + " " + phone);
    try {
        const verifiedResponse = await client.verify.
            v2.services(TWILIO_SERVICE_SID)
            .verificationChecks.create({
                to: phone,
                code: otp,
            })

        if (verifiedResponse.status == 'approved') {
            // -----------------------
            const spassword = await securePassword(req.session.signupData.password);
            const user = new User({
                name: req.session.signupData.name,
                phone: req.session.signupData.phone,
                email: req.session.signupData.email,
                password: spassword,
                isAdmin: 0,
            })
            const userData = await user.save();
            // -------------------------

            sendVerifyMail(req.session.signupData.name, req.session.signupData.email, userData._id);
            res.render('otp', { messege: "Successfully Registred, Please Verify Your Mail" })

            // --------------------------
            // ------------------------
        } else {
            res.render('otp', { messege: "Incorect Otp" })
        }
    } catch (error) {
        console.log(error.messages);
        console.log("verify OTP Section");
        res.render('cacheHandle')
    }
}





// -----------------------------------------
// verify Mail Section
const verifyMail = async (req, res) => {
    try {
        console.log("verified");
        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { is_verified: 1 } });
        console.log(updateInfo);
        res.render('email-verified');
    } catch (error) {
        console.log(error.messages);
        console.log("Verify Mail Section");
        res.render('cacheHandle')

    }
}

// Verify Login
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userDetail = await User.findOne({ email: email })
        const value = userDetail.isAdmin;
        if (userDetail && value == 0) {
            const passwordMatch = await bcrypt.compare(password, userDetail.password)
            if (passwordMatch) {
                const block = userDetail.is_blocked;
                if (block == 0) {
                    if (userDetail.is_verified == 1) {
                        req.session.user_id = userDetail._id;
                        const product = await Product.find()
                        res.redirect('/');
                    } else {
                        res.render('login', { messege: " Mail Not Varified .. Please Check Your Mail" })
                    }
                }
                else {
                    res.render('login', { messege: "You Are Blocked" })
                }
            } else {
                res.render('login', { messege: "Incorect user or password" })
            }
        } else {
            res.render('login', { messege: "Incorect user or password" })
        }
    } catch (error) {
        console.log(error.messege);
        console.log("verify login section");
        res.render('cacheHandle')
    }
}


//forget Pssword Page Loading

const forgetpage = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.messege);
        console.log("forget Password Page Section");
        res.render('cacheHandle')

    }
}

// email check for send reset Password Link
const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email
        const userData = await User.findOne({ email: email })
        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { messege: "Email Not Varified" })
            }
            else {
                const randomStringg = randomString.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomStringg } });
                sendResetPasswordMail(userData.name, userData.email, randomStringg)
                res.render('forget', { messege: "Please Check Your Mail for Reset Password" })
            }

        } else {
            res.render('forget', { messege: "Invalid Email Id" })
        }

    } catch (error) {
        console.log(error.messege);
        console.log("email Check Section for forget Password");
        res.render('cacheHandle')

    }
}

//forget Password Load Page section
const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token })
        console.log(tokenData);
        if (tokenData) {
            res.render('forget-password', { user_id: tokenData._id })
        } else {
            res.render('404', { message: "Token is Invalid" })
        }
    } catch (error) {
        console.log(error.messages);
        console.log("forget password Load Page section");
        res.render('cacheHandle')
    }
}

//Reset Password Section
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;

        const secure_password = await securePassword(password);
        const updatedData = await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: " " } })

        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
        console.log("Reset Password Section");
        res.render('cacheHandle')
    }
}


// logout Page Section

const logoutpage = async (req, res) => {
    try {
        req.session.destroy();
        // req.session.user_id=""
        res.redirect('/')

    } catch (error) {
        console.log(error.messages);
        console.log("user logout section");
        res.render('cacheHandle')
    }
}

// product view Details for User
const viewDetails = async (req, res) => {
    try {
        const id = req.query.id;
        const dataDetail = await Product.findOne({ _id: id })
        res.render('viewDetails', { dataDetail })
    } catch (error) {
        console.log(error.message);
        console.log("view Details Section");
        res.render('cacheHandle')
    }
}

// Add To Cart Section
const addToCart = async (req, res) => {
    try {

        const sessionCheck = req.session.user_id;
        if (sessionCheck) {

            const userId = req.session.user_id;
            const productId = req.query.id;

            // 
            const data = await Product.findOne({ _id: productId })
            let quantity = 1;
            let name = data.name;
            let price = data.price

            // 
            const cartCheck = await Cart.findOne({ user: userId })
            if (cartCheck) {
                const cart = await Cart.findOne({ user: userId })
                const totalPrice = cart.totalPrice + price


                let itemIndex = cartCheck.product.findIndex(p => p.productId == productId);
                if (itemIndex > -1) {
                    if (data.stock > 0 && cart.product.quantity <= data.stock) {
                        const updateResult = await Cart.updateOne(
                            { user: userId, "product.productId": productId },
                            { $inc: { "product.$.quantity": quantity } },
                        );

                        const insert = await Cart.updateOne({ user: userId }, { $set: { totalPrice: totalPrice } })
                    }
                    res.redirect('/shope')
                } else {
                    if (data.stock > 0) {
                        const insert = await Cart.updateOne({ user: userId }, { $push: { product: [{ productId, quantity, name, price }] } })
                        const insert2 = await Cart.updateOne({ user: userId }, { $set: { totalPrice: totalPrice } })
                    } res.redirect('/shope')
                }
                // -----------------
            } else {
                if (data.stock > 0) {
                    const cart = new Cart({
                        product: [{ productId, quantity, name, price }],
                        totalPrice: price,
                        user: userId
                    })
                    const save = cart.save();
                }
                res.redirect('/shope')
            }
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.messege);
        console.log("Add To Cart SEction");
        res.render('cacheHandle')

    }
}

// Cart Management 
const cartPage = async (req, res) => {
    try {
        const userId = await req.session.user_id;
        const cart = await Cart.findOne({ user: userId })
        // const cartData = await Cart.findOne({ user: userId }).populate('product.$.productId')
        // ------------------------------------
        const cartProducts = cart.product;
        const userCartProductsId = cartProducts.map(values => values.productId)

        const products = await Product.aggregate([
            {
                $match: {
                    _id: { $in: userCartProductsId }
                }
            }, {
                $project: {
                    _id: 1,
                    name: 1,
                    image: 1,
                    price: 1,

                    cartOrder: { $indexOfArray: [userCartProductsId, "$_id"] }
                }
            },
            { $sort: { cartOrder: 1 } }
        ])
        // ----------------------------------
        const totalPrice = cart.totalPrice
        res.render('cartManagement', { products, cartProducts, cart })
    } catch (error) {
        console.log(error.message);
        console.log("Cart Management Section");
        res.render('cacheHandle')
    }
}

// Remove Cart Item
const removeCart = async (req, res) => {
    try {
        const userData = await User.findById({ _id: req.session.user_id })
        const userId = userData._id;
        const cart = await Cart.findOne({ user: userId })
        const product = await Product.findOne({ _id: req.query.id })
        const price = product.price;

        const productId = await cart.product.findIndex((p) => p.productId == req.query.id)
        const quantity = parseInt(cart.product[productId].quantity)

        cart.totalPrice -= (quantity * price)
        await Cart.updateOne({ user: userId }, { $pull: { product: { productId: req.query.id } } })

        await cart.save()

        res.redirect('/cartPage')
    } catch (error) {
        console.log(error.message);
        console.log("remove cart Item Section");
        res.render('cacheHandle')
    }
}

// Change product quantity
const changeQuantity = async (req, res) => {
    const cartId = req.body.cart;
    const proId = req.body.product;
    const count = parseInt(req.body.count);
    const quantity = parseInt(req.body.quantity);

    try {
        const cart = await Cart.findOne({ _id: cartId });
        const product = await Product.findOne({ _id: proId });
        const stock = product.stock;

        const totalPrice = cart.totalPrice + count * product.price;

        await Cart.updateOne(
            { _id: cartId, "product.productId": proId },
            { $inc: { "product.$.quantity": count } }
        );

        await Cart.updateOne(
            { _id: cartId },
            { $set: { totalPrice: totalPrice } }
        );

        const updatedQuantity = quantity + count;
        const jsonResponse = { updatedQuantity, totalPrice, stock };
        res.json(jsonResponse);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
        console.log("change quantity section");
        res.render('cacheHandle')
    }
};

// Check Out Section
const checkOut = async (req, res) => {
    try {
        const user = req.session.user_id;
        const cart = await Cart.findOne({ user: user }).populate('product')
        const userData = await User.findOne({ _id: user })

        res.render('checkOut', { cart, userData })
    } catch (error) {
        console.log(error.message);
        console.log("CheckOut Section");
        res.render('cacheHandle')

    }
}

// check Out Address Loading

const addressLoad = async (req, res) => {
    try {

        const userId = req.session.user_id;
        let Address = {
            name: req.body.name,
            address: req.body.address,
            postcode: req.body.postcode,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            mobile: req.body.mobile
        }

        const userData = await User.findByIdAndUpdate(
            { _id: userId },
            { $push: { Address: [Address] } }

        )

        res.redirect('/checkOut')

    } catch (error) {
        console.log(error.message);
        console.log("chekcOut posting section");
        res.render('cacheHandle')

    }
}
// Manage User Address (list all address )
const manageAddress = async (req, res) => {
    try {
        const user = req.session.user_id
        const userData = await User.findOne({ _id: user })
        res.render('manageAddress', { userData })
    } catch (error) {
        console.log(error.message);
        console.log("Manage Address Section");
        res.render('cacheHandle')

    }
}

// Update User Address Edit
const updateAddress = async (req, res) => {
    try {
        const user = req.session.user_id;
        const userData = await User.findOne({ _id: user })
        const userAddress = userData.Address
        const value = await userAddress.find(item => item._id == req.query.id)

        res.render('updateAddress', { value })
    } catch (error) {
        console.log(error.message);
        console.log("Update Address Section");
        res.render('cacheHandle')

    }
}
// update User Address Loading
const updateLoad = async (req, res) => {
    try {
        const addressid = req.body._id
        const updated = await User.updateOne({ _id: req.session.user_id, 'Address._id': addressid },
            {
                $set: {
                    'Address.$.name': req.body.name,
                    'Address.$.address': req.body.address,
                    'Address.$.postcode': req.body.postcode,
                    'Address.$.city': req.body.city,
                    'Address.$.state': req.body.state,
                    'Address.$.country': req.body.country,
                    'Address.$.mobile': req.body.mobile,
                }
            })
        res.redirect('/manageAddress')
    } catch (error) {
        console.log(error.message);
        console.log("update user Data Loading");
        res.render('cacheHandle')
    }
}

// Delete Address Of User (Manage Address)
const deleteUser = async (req, res) => {
    try {
        const userData = req.session.user_id
        const addressid = req.query.id
        const addressDelete = await User.updateOne(
            { _id: userData },
            { $pull: { Address: { _id: req.query.id } } })

        res.redirect('/manageAddress')
    } catch (error) {
        console.log(error.message);
        console.log("user Address Delelte Section");
        res.render('cacheHandle')

    }
}

// User Profile Page
const profile = async (req, res) => {
    try {
        const userId = req.session.user_id
        const user = await User.findOne({ _id: userId })
        const userAddress = user.Address[0]

        res.render('userProfile', { user, userAddress })
    } catch (error) {
        console.log(error.message);
        console.log("user Profile Section");
        res.render('cacheHandle')

    }
}
// Add New Address Profile Section
const addNewAddress = async (req, res) => {
    try {
        res.render('addNewAddress')
    } catch (error) {
        console.log(error.message);
        console.log("Add New Address Section Profile Side ");
        res.render('cacheHandle')
    }
}

// Add New Address Load Section (profile Side)
const addNewAddressLoad = async (req, res) => {
    try {

        const userId = req.session.user_id;
        let Address = {
            name: req.body.name,
            address: req.body.address,
            postcode: req.body.postcode,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            mobile: req.body.mobile
        }

        const userData = await User.findByIdAndUpdate(
            { _id: userId },
            { $push: { Address: [Address] } }

        )
        res.redirect('/addNewAddress')

    } catch (error) {
        console.log(error.message);
        console.log("Address Load profile posting section");
        res.render('cacheHandle')

    }
}

// Order Details Of User (loading post method)
const orderDetails = async (req, res) => {
    try {

        // ---------------------
        if (req.body.payment === "COD") {
            const user = req.session.user_id;
            const cart = await Cart.findOne({ user: user }).populate('product.productId')

            let subtotal; let discountValue;
            const discount = req.body.discount;
            const percentage = req.body.percentage
            if (discount) {
                subtotal = cart.totalPrice - req.body.discount
                discountValue = discount
            } else if (percentage) {
                subtotal = cart.totalPrice - (percentage / 100) * cart.totalPrice;
                discountValue = percentage + "%"
            } else {
                subtotal = cart.totalPrice
                discountValue = "--"
            }


            const order = new Order({
                user: user,
                paymentMethod: "COD",
                paymentStatus: 'pending',
                product: cart.product,
                sellingPrice: cart.product.price,
                totalPrice: cart.totalPrice,
                discout: discountValue,
                subTotal: subtotal,
                customer: {
                    name: req.body.name,
                    Address: req.body.address,
                    postcode: req.body.postcode,
                    city: req.body.city,
                    state: req.body.state,
                    phone: req.body.mobile,
                },
                status: "orderd",
                createdDate: new Date().toLocaleDateString()

            })

            const orderData = await order.save();

            for (let i = 0; i < cart.product.length; i++) {
                let productDetails = await Product.findById({ _id: cart.product[i].productId })
                productDetails.stock -= cart.product[i].quantity
                await productDetails.save()

            }

            cart.product = []
            cart.totalPrice = 0;
            await cart.save()

            // res.render('shipping', { orderData })


            // const jsonResponse = { orderData };
            res.json({ orderData });


        }
        // -------------ONLINE PAYMENT -------------
        else {

            const user = req.session.user_id;
            const cart = await Cart.findOne({ user: user }).populate('product.productId')

            let subtotal; let discountValue;
            const discount = req.body.discount;
            const percentage = req.body.percentage
            if (discount) {
                subtotal = cart.totalPrice - req.body.discount
                discountValue = discount
            } else if (percentage) {
                subtotal = cart.totalPrice - (percentage / 100) * cart.totalPrice;
                discountValue = percentage + "%"
            } else {
                subtotal = cart.totalPrice
                discountValue = "--"
            }

            const order = new Order({
                user: user,
                paymentMethod: "ONLINE",
                paymentStatus: 'pending',
                product: cart.product,
                sellingPrice: cart.product.price,
                totalPrice: cart.totalPrice,
                discout: discountValue,
                subTotal: subtotal,
                customer: {
                    name: req.body.name,
                    Address: req.body.address,
                    postcode: req.body.postcode,
                    city: req.body.city,
                    state: req.body.state,
                    phone: req.body.mobile,
                },
                status: "orderd",
                createdDate: new Date()

            })

            const orderData = await order.save();

            // order saved here 

            var options = {
                amount: subtotal * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: "" + orderData._id
            };

            instance.orders.create(options, function (err, orders) {
                if (err) {
                    console.log("errro");
                }
                else {

                    res.json({ orders, orderData });
                }
            });

        }

    } catch (error) {
        console.log(error.messege);
        console.log("order Details Section");
        res.render('cacheHandle')
    }
}

// verify Payment ONline Payment
const verifyPayment = async (req, res) => {
    try {

        const user = req.session.user_id;
        const cart = await Cart.findOne({ user: user }).populate('product.productId')
        const orderId = req.body.order.receipt

        const crypto = require('crypto')
        const hmac = crypto.createHmac('sha256', 'WqViuHHzlHMKTSXaNtaZGQs1')
            .update(req.body.payment.razorpay_order_id + '|' + req.body.payment.razorpay_payment_id)
            .digest('hex')

        if (hmac == req.body.payment.razorpay_signature) {
            const update = { $set: { paymentStatus: "fullFill" } }
            const options = { new: true }
            await Order.findByIdAndUpdate(orderId, update, options).then(() => {
                res.json({ success: true })
            })
        } else {
            res.json({ success: false })
        }

        for (let i = 0; i < cart.product.length; i++) {
            let productDetails = await Product.findById({ _id: cart.product[i].productId })
            productDetails.stock -= cart.product[i].quantity
            await productDetails.save()

        }

        cart.product = []
        cart.totalPrice = 0;
        await cart.save()

    } catch (error) {
        console.log(error.message);
        console.log("verify Payment section");
        res.render('cacheHandle')
    }
}


// order Confirmation Page -----Shipping page
const shipping = async (req, res) => {
    try {

        res.render('shipping')
    } catch (error) {
        console.log(error.message);
        console.log("Shipping Page Section");
        res.render('cacheHandle')

    }
}



//user Seeing the order Details after Ordered
const seeOrder = async (req, res) => {
    try {

        const user = req.session.user_id;
        const order = await Order.find({ user: user }).populate('product.productId').sort({ createdDate: -1 })

        res.render('orderSee', { order })
    } catch (error) {
        console.log(error.message);
        console.log("order Details (user seeing section)");
        res.render('cacheHandle')
    }
}

// user View the Details of Order & product after ordering

const orderDetail = async (req, res) => {
    try {

        const order = await Order.findById({ _id: req.query.id }).populate('product.productId')
        const product = order.product
        res.render('orderDetail', { order, product })
    } catch (error) {
        console.log(error.message);
        console.log("order Detail Section");
        res.render('cacheHandle')
    }
}


//Cancel Order from User 
// const cancelOrder = async (req, res) => {
//     try {
//         const order = await Order.findByIdAndUpdate({ _id: req.query.id }, { $set: { status: "Canceled", paymentStatus: "Canceled" } })
//         res.redirect('/seeOrder')

//     } catch (error) {
//         console.log(error.message);
//         console.log("cancel Order");
//         res.render('cacheHandle')

//     }
// }

const cancelOrder = (req, res) => {

    return new Promise((resolve, reject) => {
        Order.findByIdAndUpdate(
            { _id: req.body.orderId },
            { $set: { status: "Canceled", paymentStatus: "Canceled", reasonOfCancel: req.body.reason } }
        ).then((order) => {
            res.json(order)

        }).catch((error) => {
            console.log(error.message);
            console.log("cancel Order");
            res.render('cacheHandle');
            reject(error);
        });
    });
};

// /returnOrder from user
const returnOrder = (req, res) => {

    return new Promise((resolve, reject) => {
        Order.findByIdAndUpdate(
            { _id: req.body.orderId },
            { $set: { status: "returneProcessing", paymentStatus: "refundProcessing", reasonOfReturn: req.body.reason } }
        ).then((order) => {
            res.json(order)
            // resolve(order);
        }).catch((error) => {
            console.log(error.message);
            console.log("cancel Order");
            res.render('cacheHandle');
            reject(error);
        });
    });
};



// Shope Page Section

const shopePage = async (req, res) => {
    try {

        const category = (req.query.categoryId)
        const search = (req.query.search) || "";
        const sort = (req.query.sort) || "";
        let isRender = false;

        if (req.query.isRender) {
            isRender = true
        }

        const searchData = new String(search).trim()

        const query = {
            is_delete: false,
        }

        let sortQuery = { price: 1 }
        if (sort == 'high-to-low') {
            sortQuery = { price: -1 }
        }

        if (search) {
            query["$or"] = [
                { name: { $regex: ".*" + searchData + ".*", $options: "i" } },
                { description: { $regex: searchData, $options: "i" } },
            ];
        }

        if (category) {
            query["$or"] = [
                { category: category }
            ];
        }


        const product = await Product.find(query).sort(sortQuery)

        const productsPerPage = 5;
        const page = req.query.page || 1;
        const startIndex = (page - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const pageProducts = product.slice(startIndex, endIndex);
        const totalPages = Math.ceil(product.length / productsPerPage);
        // -----------Category finding
        const categoryData = await Catogery.find({})

        // ----------------------
        let cartCount = 0;
        const cartData = await Cart.findOne({ user: req.session.user_id }).populate('product')
        if (cartData) {
            cartCount = cartData.product.length
        } else {
            cartCount = 0;
        }
        // -------------------
        let wishListCount = 0;
        const wishListData = await WishList.findOne({ user: req.session.user_id }).populate('product')
        if (wishListData) {
            wishListCount = wishListData.product.length
        } else {
            wishListCount = 0;
        }
        // ---------------------
        if (isRender == true) {
            res.json({
                pageProducts,
                totalPages,
                currentPage: parseInt(page, 10),
                product,
                cartCount,
                wishListCount
            })
        } else {
            res.render('shope', {
                pageProducts,
                totalPages,
                currentPage: parseInt(page, 10),
                product,
                cartCount,
                wishListCount,
                categoryData

            });
        }

    } catch (error) {
        console.log(error.message);
        console.log("Shope Page Section");
        res.render('cacheHandle')

    }
}


// Whishlist Page 

const wishlistPage = async (req, res) => {
    try {

        const userId = await req.session.user_id;
        const wishList = await WishList.findOne({ user: userId })
        //   -----------------------------------------------

        const wishListProducts = wishList.product;
        const wishListProductsId = wishListProducts.map(values => values.productId)


        const products = await Product.aggregate([
            {
                $match: {
                    _id: { $in: wishListProductsId }
                }
            }, {
                $project: {
                    name: 1,
                    image: 1,
                    price: 1,

                    wishlistProductsimages: { $indexOfArray: [wishListProductsId, "$_id"] }
                }
            },
            { $sort: { wishlistProductsimages: 1 } }
        ])

        // --------------------------------------------------

        res.render('whishlistManagement', { wishListProducts, wishList, products })
    } catch (error) {
        console.log(error.messege);
        console.log("whish list Page");
        res.render('cacheHandle')
    }
}

//Add To whishList

const addToWishList = async (req, res) => {
    try {

        const sessionCheck = req.session.user_id;

        if (sessionCheck) {

            const userId = req.session.user_id;
            const productId = req.query.id;
            // -----
            const data = await Product.findOne({ _id: productId })
            let name = data.name;
            let price = data.price
            // -----

            const whishlistCheck = await WishList.findOne({ user: userId })
            if (whishlistCheck) {

                let itemIndex = whishlistCheck.product.findIndex(p => p.productId == productId);
                if (itemIndex > -1) {

                    res.redirect('/shope')

                } else {

                    const insert = await WishList.updateOne({ user: userId }, { $push: { product: [{ productId, name, price }] } })
                    res.redirect('/shope')
                }

            } else {
                const whishList = new WishList({
                    product: [{ productId, name, price }],
                    user: userId
                })
                const save = whishList.save();
                res.redirect('/shope')
            }

        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message);
        console.log("add To WishList Page ");
        res.render('cacheHandle')

    }
}

// remove Wish List 

const removeWishList = async (req, res) => {
    try {

        const userId = req.session.user_id
        const user = await WishList.findOne({ user: req.session.user_id })

        await WishList.updateOne({ user: userId }, { $pull: { product: { productId: req.query.id } } })

        res.redirect('/wishlistPage')
    } catch (error) {
        console.log(error.message);
        console.log("remove WishList");
        res.render('cacheHandle')
    }
}

module.exports = {
    landPage, loginPage, signupPage, insertUser, verifyLogin, verifyOtp,
    logoutpage, forgetpage, forgetVerify, verifyMail, forgetPasswordLoad, resetPassword, viewDetails, addToCart
    , cartPage, removeCart, changeQuantity, checkOut, addressLoad, manageAddress, updateAddress, updateLoad, deleteUser, profile, addNewAddress,
    addNewAddressLoad, orderDetails, resendOtp, shopePage, seeOrder, orderDetail, cancelOrder, wishlistPage, addToWishList, removeWishList, returnOrder,
    shipping, verifyPayment
}
