const mongoose = require('mongoose');

const connectDb = (connectionStr) => {
    return mongoose.connect(connectionStr);
}

module.exports = connectDb;