const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
dotenv.config({ path: `${path.join(__dirname, '..', '..', 'config.env')}` });

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

const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'tours-simple.json'), {
    encoding: 'utf8',
  })
);
const importData = async function () {
  try {
    await Tour.insertMany(data);
    console.log('Data imported!');
  } catch (err) {
    console.log(err.message);
  } finally {
    process.exit();
  }
};
const DeleteData = async function () {
  try {
    await Tour.deleteMany({});
    console.log('Data Deleted!');
  } catch (err) {
    console.log(err.message);
  } finally {
    process.exit();
  }
};
if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  DeleteData();
}
