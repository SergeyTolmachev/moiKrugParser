const winston = require('winston');
const path = require('path');


const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, '/errorsLogs/error.log') }),
  ],

  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
});

class ErrorHandler {
  logError(number, innerText, defaultText) {
    console.log(__dirname);
    let errorText = {};
    errorText.message = defaultText.message;
    errorText.name = defaultText.name;
    errorText.stack = defaultText.stack;
    errorText = JSON.stringify(errorText, null, 4);
    logger.error(`произошла ошибка № ${number}\n описание ошибки: ${innerText}\n оригинальный текст ошибки:\n ${errorText}`);
  }
}

const errorHandler = new ErrorHandler();

module.exports = errorHandler;
