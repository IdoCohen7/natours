const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! SHUTTING DOWN...');
  console.log(`${err.name}: ${err.message}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
  })
  .catch((err) => {
    console.error('DB connection error:', err.name, err.message);
    process.exit(1);
  });

const app = require('./app');

// START THE SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

function handleUnhandledRejections(err) {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);

  server.close(() => {
    process.exit(1);
  });
}

process.on('unhandledRejection', (err) => {
  handleUnhandledRejections(err);
});
