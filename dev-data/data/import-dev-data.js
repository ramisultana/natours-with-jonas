//TODO: that file run once at the beggining (review lecture num 94)
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })

  .then(() => {
    // console.log(con.connections);
    console.log('db connection successful');
  });
// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

//import data ito DB
const importData = async () => {
  try {
    await Tour.create(tours);
    await Review.create(reviews);
    await User.create(users, { validateBeforeSave: false });
    console.log('data successfuly loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //stop application and exit
};
// delet all data from DB
const deletData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('data successfuly deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit(); //stop application and exit
};
//TODO: here we creat a command line
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deletData();
}
console.log(process.argv); //TODO: gave us a array of what we write in the comand line
//node dev-data/data/import-dev-data.js
//node ./dev-data/data/import-dev-data.js --import
//node ./dev-data/data/import-dev-data.js --delete
