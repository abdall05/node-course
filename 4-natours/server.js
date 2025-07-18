const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: `${path.join(__dirname, 'config.env')}` });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected to DB successfully!');
  });

const app = require('./app');
const port = process.env.PORT;

// console.log(app.get('env')); // set by express
// console.log(process.env); //set by node.js
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message),
    server.close(() => {
      process.exit(1);
    });
});
