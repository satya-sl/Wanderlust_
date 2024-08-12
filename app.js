const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const {listingSchema , reviewSchema} = require('./schema.js')
const Review = require("./models/review.js");


const listings = require("./routes/listing.js");



//now setting views for ejs
const path = require("path");
const { error } = require("console");

main().then(()=> console.log("Database is connnected")).catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
//view setup completed
app.use(express.urlencoded({extended:true})); // use full to get req.params
//method override wie updating
app.use(methodOverride("_method"))
// use ejs-locals for all ejs templates:   // for ejs mate
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public"))); //to access static files

//basic first api
app.get("/",(req,res)=>{
   res.send("Hi, im root")
})

app.listen(8080,()=>{
    console.log(" server is listining to the port : 8080")
})


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



//    ------------------ Listings ---------------------
app.use("/listings",listings);







//    ------------------ Reviews ---------------------
// post
app.post("/listings/:id/reviews",  validateReview ,  wrapAsync(async(req,res) =>{
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
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req,res)=>{
    let{id , reviewId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}))



//              ---------   Error handling  ------------

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
    console.log(err);
    let {statusCode = 500 ,message = "something went wrong"} = err;
    res.render("error.ejs",{err})
   // res.status(statusCode).send(message);
})

/* error handing at beginner stage 
app.use((err,req,res,next)=>{
    res.send("something went wrong") // at starating to test this " we made price - as (text from numbers)
})

/*
app.get("/testListing", async (req,res)=>{
    let sampleListing = new Listing({
        title: "My new villa",
        description:"by the beach",
        price:1200,
        location: " Calangute, goa",
        country: "India",
    });
    await sampleListing.save();
    console.log(sampleListing);
    res.send("Testing succesful")
})*/