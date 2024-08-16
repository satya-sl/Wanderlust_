const express = require("express");
const app = express();
const session = require("express-session");
var flash = require('connect-flash');

// Set up session middleware
const sessionOptions = {
    secret:"my secret string",
    resave:false,
    saveUninitialized: true
}
app.use(session( sessionOptions ))
// middleware  Set up complete


// Route to register the user's name in the session
app.get("/register",(req,res)=>{
    let {name = "anonymous"} = req.query;
    req.session.name = name;        //Storing information in session
   // res.send(name);
    res.redirect("/hello")
})

app.get("/hello",(req,res)=>{
 
    res.send(`hello ${req.session.name}`); //using session information in another route - using "req.session"
})
// if use these both (/register & /hello routes) U can understand "session storing & using"
// session work is to store the useful information and use it in different pages


app.get("/test",(req,res)=>{
    res.send("test successful")
})
app.listen(8088,()=>{
    console.log("Server is listing to port 8088")
})