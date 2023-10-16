// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const wishListData= new mongoose.Schema({
    
    product:[{

        productId:mongoose.Schema.Types.ObjectId,
        name:String,
        price:Number 
    }

],
    user:{
        // type:ObjectId,
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }  
})


module.exports=mongoose.model('WishList',wishListData)