// const { ObjectId } = require('mongodb');
const mongoose=require('mongoose');

const productData= new mongoose.Schema({
    
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        // type:ObjectId,
        type:mongoose.Schema.Types.ObjectId,
       ref:'Catogery'
    },
    image:{
        type:Array
        // required:true
    },
    stock:{
        type:Number,
        required:true
    },
    is_delete:{
        type:Boolean,
        default:false
    }
   
   
})

module.exports=mongoose.model('Product',productData)