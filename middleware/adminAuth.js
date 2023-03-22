// login 
const isLogin = async (req, res, next) => {
    try {
        if (req.session.admin_id) {
            next()
        }
        else {
            res.redirect('/admin')
        } 
       
     
    } catch (error) {
        console.log(error.messege);
        console.log("middlware side login admin");
    }
}


// logOut
const isLogOut = async (req, res, next) => {

    try {

        if (req.session.admin_id) {
            res.redirect('/admin/home')
        }
        else {
            next();
        }

    } catch (error) {
        console.log(error.messege);
        console.log("middlware side logout");
    }
}

module.exports = {
    isLogin, isLogOut
}