const express = require("express")
const router =express.Router();
const wrapAsync = require('../utils/wrapAsync.js')
const ExpressError = require('../utils/ExpressError.js')
const {listingSchema , reviewSchema} = require('../schema.js')
const Listing = require("../models/listing.js");


// validation for schema as function use it as "middleWare"
const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(","); 
        throw new ExpressError(400 ,errMsg)
    }
    else{
        next()
    }
}



//index route
router.get("/",async (req,res)=>{
    const allListings =  await  Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

//new route
router.get("/new",(req,res)=>{
    res.render("listings/new.ejs")
})
//create route
router.post("/", validateListing, wrapAsync(async(req,res,next) =>{
    //let {title ,description ,image,price,country,location} = req.body;   1 way u can use objec too
    //let listing = req.body.listing ;       //like this making object ,"listing[title]"
    
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect("listings");
}))

/*      try-catch block example
app.post("/listings", async(req,res,next) =>{
    try{
        //let {title ,description ,image,price,country,location} = req.body;   1 way u can use objec too
        //let listing = req.body.listing ;       //like this making object ,"listing[title]"
        let newListing = new Listing(req.body.listing);
        await newListing.save();
        console.log(newListing);
        res.redirect("/listings");
    }catch(err){
        next(err);
    }
})*/


//edit route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;   //extracting id
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
}))

//update route
router.put("/:id", validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
  await  Listing.findByIdAndUpdate(id,{...req.body.listing});
  //res.redirect("/listings");
  res.redirect(`/listings/${id}`); // takes to show(specific listing ) after editing submition
}))


//show route , shows specific listing data(view)  , for this we already changed in index.js to get "id"
router.get("/:id", wrapAsync( async (req,res)=>{
    let {id} = req.params;   //extracting id
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}));

//delete route
router.delete("/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("listings");
}))

module.exports = router