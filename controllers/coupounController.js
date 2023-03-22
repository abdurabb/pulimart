const Coupoun = require('../models/coupon');
const Cart = require('../models/cart')

//coupoun Management
const coupounManagement = async(req,res)=>{
    try {

        const coupounData = await Coupoun.find({})
        res.render('coupounManagement',{coupounData})
    } catch (error) {
        console.log(error.messege);
        console.log("counpoun controller counpoun Management");
        res.render('cacheHandle')
    }   
    
}
// add coupoun
const addCoupoun = async(req,res)=>{
    try {
        res.render('addCoupoun',{messege:""})
    } catch (error) {
        console.log(error.messege);
        console.log("add coupoun Management");
        res.render('cacheHandle')
   
    }
}

// Coupoun Load
const coupounLoad = async(req,res)=>{
    try {


        
        

         const code= req.body.code;
        const coupounDetail = await Coupoun.findOne({ code: { $regex: '.*' + code + '.*', $options: 'i' } })
        if(coupounDetail){
            res.render('addCoupoun',{messege:"Already Created"})
        }
       else{
       
        const cop = new Coupoun ({
            code: req.body.code,
            discountType:req.body.discountType,
            discountAmount:req.body.discount,
            maxDiscountAmount:req.body.maxdiscount,
            minPurchase:req.body.minPurchase,
            createDate:new Date(),
            expiryDate:req.body.expiryDate

        })
     
      const loc=  await cop.save()
    //   res.redirect('/admin/addCoupoun')

    res.render('addCoupoun',{ messege:"Successfully Created"})
    }
    } catch (error) {
        console.log(error.messege);
        console.log("coupoun Load Section");
        res.render('cacheHandle')
        
    }
}

//update Coupoun 
const updateCoupoun= async (req,res)=>{
    try {
     
        const coupoun = await Coupoun.findById({_id:req.query.id})
       
        res.render('updateCoupoun',{coupoun})
    } catch (error) {
        console.log(error.messege);
        console.log("update Coopen Section");
        res.render('cacheHandle')
    }
}

// update Coupoun Load
const updateCoupounLoad = async (req,res)=>{
    try {
        const coupounData = await Coupoun.findByIdAndUpdate({ _id: req.body.id }, { $set: { code: req.body.code, discountType: req.body.discountType, discountAmount: req.body.discount, maxDiscountAmount: req.body.maxdiscount, minPurchase: req.body.minPurchase, createDate:req.body.createDate,expiryDate:req.body.expiryDate } })
        res.redirect('/admin/coupounManagement')
    } catch (error) {
        console.log(error.messege);
        console.log("update Coupoun Load Section");
        res.render('cacheHandle')
    }
}
// Delete Coupoun 
const deleteCoupoun = async (req,res)=>{
    try {
        const id = req.query.id;
        await Coupoun.findByIdAndDelete({ _id: id })
        res.redirect('/admin/coupounManagement')

    } catch (error) {
        console.log(error.messege);
        console.log("delete Coupoun Section");
        res.render('cacheHandle')

    }
} 

//coupoun Code Apply from user
const coupounCodeApply = async (req,res)=>{
    try {

        let messege ;
        let discount;
        let percentage;
        
        const cart = await Cart.findOne({user:req.session.user_id})
        const coupoun = await Coupoun.findOne({code:req.body.code})
       
        if(coupoun){ 
            let time= new Date()
            if(time > coupoun.expiryDate){
                messege="Coupoun Expired"
            }else{
                console.log("else");
            if(cart.totalPrice >= coupoun.minPurchase){
            if(coupoun.discountType == 'flat'){
             
               messege="Coupoun Valid"
                discount = coupoun.discountAmount
            }else{
                messege="Coupoun Valid"
                percentage=parseInt(coupoun.discountAmount)
            }
            }else{
                messege="please purchase above"+coupoun.minPurchase +" Rs for use This Coupoun"
            }
        }}
        else{
            messege="coupoun invalid"
        }

        const jsonResponse={messege,discount,percentage}
        res.json(jsonResponse);

    } catch (error) {
        console.log(error.messege);
        console.log("coupounCode Apply Section");
        res.render('cacheHandle')

    }
}


module.exports = {
    coupounManagement,
    addCoupoun,
    coupounLoad,
    updateCoupoun,
    updateCoupounLoad,
    deleteCoupoun,
    coupounCodeApply 
}