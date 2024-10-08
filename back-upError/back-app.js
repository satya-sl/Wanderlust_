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


//const listings = require("./routes/listing.js");  as commented i didn't required "routes"(folder)


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
app.get("/listings/",async (req,res)=>{
    const allListings =  await  Listing.find({});
    res.render("listings/index.ejs",{allListings});
});

//new route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})
//create route
app.post("/listings", validateListing, wrapAsync(async(req,res,next) =>{
    //let {title ,description ,image,price,country,location} = req.body;   1 way u can use objec too
    //let listing = req.body.listing ;       //like this making object ,"listing[title]"
    
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    console.log(newListing);
    res.redirect("/listings");
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
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
    let {id} = req.params;   //extracting id
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing})
}))

//update route
app.put("/listings/:id", validateListing,wrapAsync(async(req,res)=>{
    let {id}= req.params;
  await  Listing.findByIdAndUpdate(id,{...req.body.listing});
  //res.redirect("/listings");
  res.redirect(`/listings/${id}`); // takes to show(specific listing ) after editing submition
}))


//show route , shows specific listing data(view)  , for this we already changed in index.js to get "id"
app.get("/listings/:id", wrapAsync( async (req,res)=>{
    let {id} = req.params;   //extracting id
    const listing = await Listing.findById(id).populate("reviews");
    console.log(listing);
    res.render("/listings/show.ejs",{listing});
}));

//delete route
app.delete("/listings/:id", wrapAsync(async (req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}))





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