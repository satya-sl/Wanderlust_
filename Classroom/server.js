const express = require("express");
const app = express();
const session = require("express-session");
var flash = require('connect-flash');
const path = require("path");           //path
                                        //view setup
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));


// Set up "session" middleware
const sessionOptions = {
    secret:"my secret string",
    resave:false,
    saveUninitialized: true
}
app.use(session( sessionOptions ))
// middleware  Set up complete
app.use(flash())
//flash middleware

                            // success and 
                            //"res.locals"  -  set variables accessible in templates rendered with res.render.
app.use(function (req, res, next) {
    // Make `user` and `authenticated` available in templates
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    next()
  })

// Route to register the user's name in the session
app.get("/register",(req,res)=>{
    let {name = "anonymous"} = req.query;
    req.session.name = name;        //Storing information in session

    // Set a flash message by passing the key, followed by the value, to req.flash().
   // req.flash('success', 'User registerd succesfully')
    if(name != "anonymous")
        req.flash('success', 'User registerd succesfully')
    else
       req.flash('error', 'User not registerd ')
    res.redirect("/hello")
})


app.get("/hello",(req,res)=>{        //this variable  {msg:} accesable in the page.ejs ,use there to show flash
    //res.render('page.ejs',{name:req.session.name,msg:req.flash("success")})  

//using req.flash() & sucess key    """we r accesing its value"""
//res.render('page.ejs',{name:req.session.name})   //this variable{name:} accesable in the page.ejs 


    res.render('page.ejs',{name:req.session.name}) //another simple way
})
    


/*
app.get('/', function(req, res){
    // Get an array of flash messages by passing the key to req.flash()
    res.render('/page', { messages: req.flash('info') });
  });
*/


app.listen(8088,()=>{
    console.log("Server is listing to port 8088")
})