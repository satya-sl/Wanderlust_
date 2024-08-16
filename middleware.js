const Listing = require("./models/listing.js");   //at isOwner u used 
const mongoose = require("mongoose");

module.exports.isLoggedIn =(req,res,next)=>{
    if(!req.isAuthenticated()){       // not authenticated
        req.session.redirectUrl = req.originalUrl        //stores the full path 
        req.flash("error","You have to be logged to do this")
        return res.redirect("/login")
    }
    next()
}
 
module.exports.saveRedirectUrl =(req,res,next)=>{
    if(req.session.redirectUrl)
        res.locals.redirectUrl = req.session.redirectUrl;     //storing local varaiable  
                                                  // so even passport resets session, local variable stores
    next()
}


module.exports.isOwner = async (req, res ,next)=>{
    let {id} = req.params
    let  listing = await Listing.findById(id)
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","u dont have permission to do this")
        return res.render(`/listings/${id}`) //if not return the other statements after if else also executes
    }
    next()
}