const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Review = require('../../models/reviewModel'); // Update this path to your User model

dotenv.config({ path: './config.env' }); // Adjust path to reach the config file

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

// // READ JSON FILE
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
); // Ensure the JSON file exists

// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Review.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Review.deleteMany(); // Deleting all user data
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Check command line argument to decide whether to import or delete
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
