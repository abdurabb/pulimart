const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const cartData= new mongoose.Schema({
    
    product:[{
        // type:ObjectId,
        // ref:"Product",
        // required:true,

        productId:ObjectId,
        quantity:Number,
        name:String,
        price:Number 
    }
   
],
totalPrice:{
    type:Number,
    default:0,
    // required:true
},
    user:{
        type:ObjectId,
        ref:"User",
        required:true
    }  
})


// ---------------------------------------------------------
// const productSchema = new mongoose.Schema({
//     productID:{
//         type:ObjectId,
//     },
//     name:{
//         type:String
//     },price:{
//         type:Number,
//     },
//     quantity:{
//         type:Number,
//         default:1

//     }
// })

// // -------
// const cartData= new mongoose.Schema({
    
//     product:[productSchema],
//     user:{
//         type:ObjectId,
//         ref:"User",
//         required:true
//     }  
// })


// ------------------------------------------------------------

module.exports=mongoose.model('Cart',cartData)