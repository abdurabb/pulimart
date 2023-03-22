const mongoose=require('mongoose');

const productCategory= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
   
    is_delete:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('Catogery',productCategory)