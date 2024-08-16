const express = require("express");
const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
// const {listingSchema , reviewSchema} = require('./schema.js')     no need because we used in the "routes as needed there only"
//const Review = require("./models/review.js");
//const Listing = require("./models/listing.js");

const session = require("express-session")
const flash = require("connect-flash")

const passport =require("passport")
const localStrategy = require("passport-local")
const User = require("./models/user.js")           //required user model for login & signup paage


const listingsRoute = require("./routes/listing.js"); //  as commented i didn't required "routes"(folder)
const reviewsRoute = require("./routes/review.js"); //  as commented i didn't required "routes"(folder)
const usersRoute = require("./routes/user.js"); //  as commented i didn't required "routes"(folder)



//now setting views for ejs
const path = require("path");
const { error } = require("console");
const { nextTick } = require("process");

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




const sessionOptions = {
    secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7 *24*60*60*1000,  // 7 days, 24 hours,60 min,60 sec,1000 milisec
    maxAge:7*24*60*60*1000,
    httpOnly:true, // to protect from Cross Scripting attacks
  }
}
//to use session
app.use(session(sessionOptions)) // to veriy cookies are used "See the Cookies Application tab (connect.sid)"
//to use  use before routes
app.use(flash())        // flash use




app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

                      // local variables
//middleware definnig
app.use((req,res,next)=>{
    res.locals.success = req.flash("success")   //res.locals.success   variable
    res.locals.errors =req.flash("error")
    res.locals.currUser = req.user
    next() //  to go to next , otherwise it stuck here only
})


//                  ---------------------            api's           ------------------------
//basic first api
app.get("/",(req,res)=>{
   res.send("Hi, im root")
})

app.listen(8088,()=>{
    console.log(" server is listining to the port : 8080")
})


app.get("/demouser",async (req,res)=>{
    let fakeUser = new User({
        email:" DeltaStudent@gmail.com",
        username : "DeltaStudent",
    })         //.register() it is static method                      // to store we use "User.register()" method
    let registerUSer = await User.register(fakeUser,"P@$$30r6")// User.register -> automatically saves user,password in db 
    res.send(registerUSer)
})



//    ------------------ Route ---------------------


app.use("/listings", listingsRoute)




//    ------------------ Reviews ---------------------

app.use("/listings/:id/reviews", reviewsRoute)

app.use("/",usersRoute) // for user routes


//              ---------   Error handling  ------------

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page not found!"));
});

app.use((err,req,res,next)=>{
   // console.log(err);
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