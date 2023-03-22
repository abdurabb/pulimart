const mongoose=require('mongoose');

const userData= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
    ,
    isAdmin:{
        type:Number,
        required:true  
    },
    is_verified:{
       type:Number,
       default:0
    },
    token:{
        type:String,
        default:" "
    },
    is_blocked:{
        type:Number,
        default:0
    },
    Address:[{
        name:{
            type:String
        },
        address:{
            type: String
            
        },
        postcode:{
            type:String
           
        },
        city:{type:String
            
        },
        state:{
            type:String
           
        },
        country:{
            type:String
        },
        mobile:{
            type:String
        }
        
    }]
   
})

module.exports=mongoose.model('User',userData)