const mongoose = require('mongoose');

const dotenv = require('dotenv'); //A

process.on('uncaughtException', (err) => {
  //err like if we console.log(x) and x is not defined
  console.log('UNHANDLED EXCEPTION !   SHUTTING DOWN');
  console.log(err.name, err.message);

  // here firsr we close the server then we exit
  process.exit(1); // 0 for success , 1 for uncaught exception
});

dotenv.config({ path: './config.env' }); //B TODO: now we can read variable from our file config.env by using process.env
// console.log(process.env); //TODO: print our variable in config.env
const app = require('./app');

//C
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

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app running on port ${port}...`);
});

//(safety net)
//TODO: code below handle any promise rejection that not catshed by any where in our code , happen outside our express  like error in our password with database
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION!   SHUTTING DOWN');
  server.close(() => {
    // here firsr we close the server then we exit
    process.exit(1); // 0 for success , 1 for uncaught exception
  });
});
