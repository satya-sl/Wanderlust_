const express = require("express");
const user = require("../models/user");
const router =express.Router();
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

                    // signup routes
router.get("/signup", (req,res)=>{
    res.render("users/signup.ejs")
})

router.post( "/signup", 
    wrapAsync(async(req,res)=>{
  try{
    let {username,email,password} = req.body; // extracting data from signup form
    // Creating a new user      (for this u have to require User mode)
    const newUser = new user({email,username})
    const registerUser = await User.register(newUser,password)     //Storing info in data base
    console.log(registerUser)
    req.login(registerUser,(err)=>{
      if(err){
        return next(err)
      }
      req.flash("success","Welcome to Wanderlust");
    res.redirect("/listings")
    })
  }catch(e){
    req.flash("error",e.message)
    res.redirect("/signup")
  }
})
) 


                                 // login routes
router.get("/login", (req,res)=>{
  res.render("users/login.ejs")
})
                     //passport.authenticate()  is a middleware used to authenticate
router.post( "/login",
  saveRedirectUrl,
   passport.authenticate('local',               //if this authetication is satisfied then only here callback works
                { failureRedirect: '/login',
                  failureFlash:true ,
                }),
  wrapAsync(async(req,res)=>{
    req.flash("success","Welcome back to Wanderlust")
 //   res.send("Welcome back")
    let redirectUrl = res.locals.redirectUrl || "/listings"
    res.redirect( redirectUrl)
  })
)


                      // logout user
router.get('/logout',(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err)
    }
    req.flash("success","You logged out")
    res.redirect("/listings")
  })
})
module.exports = router