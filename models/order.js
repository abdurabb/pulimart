
const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const orderData= new mongoose.Schema({
    
    user:{
        type:ObjectId,
        ref:'User'
    },
    paymentMethod:{
        type:String,
        
    },
    paymentStatus:{
        type:String,
        default:'pending'
    },
    product:[
        {
            productId:{
                type:ObjectId,
                ref:'Product'},
                quantity:Number,
                sellingPrice:Number
        }
    ],
    
    totalPrice:Number,
    discout:String,
    subTotal:Number,
    reasonOfCancel:String,
    reasonOfReturn:String,

    customer:{
        name:String,
        Address:String,
        postcode:String,
        city:String,
        state:String,
        phone:String,
    },

    status:{
        type:String,
        default:"orderd"
    },

    createdDate:{
        type:Date,
        default:new Date().toLocaleDateString()
    }
   
   
})

module.exports=mongoose.model('Order',orderData)