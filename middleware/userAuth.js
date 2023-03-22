const User = require('../models/userModel');

// login 
const isLogin=async(req,res,next)=>{
    const userDetail = await User.findOne({ _id: req.session.user_id })
    try {
        if(req.session.user_id){
            const block = userDetail.is_blocked;
            if (block == 0) {

            }else{
                res.redirect('/')
            }

        }else{
            res.redirect('/')
        }
        next();
    } catch (error) {
        console.log(error.messege);
        console.log("middlware side login");
    }
}


// logOut
const isLogOut=async(req,res,next)=>{
    try {   
        if(req.session.user_id){
            res.redirect('/home')
        }else{
        next();
        }

    } catch (error) {
        console.log(error.messege);
        console.log("middlware side logout");
    }
}

module.exports={
    isLogin,isLogOut
}