const dotenv = require('dotenv');

const mongoose = require('mongoose');

dotenv.config({ path: './config.env' }); // BOTH LINES MUST APPEAR BEFORE REQUIRING THE APP

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log('DB connection successful');
  });

const app = require('./app');

// START SERVER
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
