
// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const couponData= new mongoose.Schema({
    
    code:{
        type:String, 
        required:true
    },
    discountType:{
        type:String, 
        enum:['percentage','flat'],
       
    },
    discountAmount:{
        type:String
    },
    maxDiscountAmount:{
        type:String,
        required:true
    },
    minPurchase:{
        type:String,
        required:true
    },

    createDate:{
        type:Date, 
    },
    expiryDate:{
        type:Date, 
    },
   
    
})

module.exports=mongoose.model('Coupon',couponData)