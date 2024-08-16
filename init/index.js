
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

    initData.data = initData.data.map(obj => ({...obj,owner:'66be078e72b1c8dec4381059'})) // reinitialize adding owner
                                              // adding all the exising data +owner 
    await  Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();
