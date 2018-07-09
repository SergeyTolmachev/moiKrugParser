const winston = require('winston');
const moment = require('moment');
require('winston-daily-rotate-file');


function getTimeStamp() {
  return moment().format('YYYY-MM-DD hh:mm:ss');
}


function formatter(args) {
  const getDateTime = moment().format('YYYY-MM-DD hh:mm:ss');
  const logMessage = `${getDateTime} - ${args.level}: ${args.message}`;
  return logMessage;
}

const transports = [

  new (winston.transports.DailyRotateFile)({
    name: 'debugFile',
    level: 'debug',
    filename: './src/logs/%DATE%debug.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '17d',
    timestamp: getTimeStamp,

  }),


  new (winston.transports.DailyRotateFile)({
    name: 'errorsFile',
    level: 'error',
    filename: './src/logs/%DATE%errors.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '17d',
    timestamp: getTimeStamp,

  }),


  new winston.transports.Console({
    timestamp: getTimeStamp,
    colorize: true,
    level: 'info',
  }),


];

module.exports = new winston.Logger({
  transports,
});
