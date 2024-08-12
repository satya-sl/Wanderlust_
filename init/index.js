
const mongoose = require("mongoose");
const Listing = require("../models/listing"); // Relative path to listing.js
const initData = require("./data");


main().then(()=> console.log("Database is connnected")).catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}


const initDB = async () =>{
    
    await  Listing.deleteMany({});
    await  Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();
