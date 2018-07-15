const Sequelize = require('sequelize');
const psqlUrl = require('./psqlUrl');
const logger = require('../Logger');

const sequelize = new Sequelize(psqlUrl, {logging: false,});

sequelize
  .authenticate()
  .then(() => {
    logger.info('Connection has been established successfully.');
  })
  .catch((err) => {
    logger.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
