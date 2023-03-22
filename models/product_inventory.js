const mongoose=require('mongoose');

const productInventory= new mongoose.Schema({
    quantity:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model('Inventory',productInventory)