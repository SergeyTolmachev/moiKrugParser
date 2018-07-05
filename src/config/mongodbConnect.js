const mongoose = require('mongoose');
const mongodbUrl = require('./mongodbUrl');

mongoose.connect(mongodbUrl.mongodbUrl);

let db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('мы успешно подключились');
});

module.exports.db = db;