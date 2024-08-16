const express = require("express")
const router =express.Router();
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema , reviewSchema} = require('../schema.js')
const Review = require("../models/review.js");
const Listing = require("../models/listing.js"); // cause we are working on them
const {isLoggedIn} = require("../middleware")         // middleware to authenticate at every route we needed


// validation for schema as function use it as "middleWare"
const validateReview = (req,res,next)=>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(","); 
        throw new ExpressError(400 ,errMsg)
    }
    else{
        next()
    }
}

/*      /listings/:id/reviews    this route is "common in all routes" so taking it  and using in "app.js"     */


// post
router.post("/",   isLoggedIn  , validateReview ,  wrapAsync(async(req,res) =>{
    //console.log("review route working")
   let listing = await Listing.findById(req.params.id);
   let newReview = new Review(req.body.review);

   listing.reviews.push(newReview);

   await newReview.save();
   await listing.save(); //whenever there is change in existing document.

  /* console.log("new review saved")   to verify its working we used
   res.send("new review is added")*/
   res.redirect(`/listings/${req.params.id}`);
}))

// delete review       listings/:listingId/reviews/:reviewId
router.delete("/:reviewId",   isLoggedIn  ,wrapAsync(async (req,res)=>{
    let{id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))

module.exports = router   // if i miss this  , it will show
                          // Router.use() requires a middleware function but got a Object