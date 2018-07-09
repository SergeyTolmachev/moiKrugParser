const mongoose = require('mongoose');
const mongodbUrl = require('./mongodbUrl');
const log = require('../Logger');


mongoose.connect(mongodbUrl.mongodbUrl);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  log.info('мы успешно подключились');
});

module.exports.db = db;
