require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecom';
const options = { serverSelectionTimeoutMS: 5000 };

console.log('Testing URI:', MONGO_URI);

mongoose.connect(MONGO_URI, options)
  .then(() => {
    console.log('OK');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('ERR', err.message);
    process.exit(1);
  });
