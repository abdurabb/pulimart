const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const wishListData= new mongoose.Schema({
    
    product:[{

        productId:ObjectId,
        name:String,
        price:Number 
    }

],
    user:{
        type:ObjectId,
        ref:"User",
        required:true
    }  
})


module.exports=mongoose.model('WishList',wishListData)