const mongoose = require('mongoose');
const vacanciesSchema = require('../schemas/vacanciesSchema');
const db = require('../config/mongodbConnect');
const logger = require('../Logger');



class Vacancy {
  constructor() {
    this.model = mongoose.model('vacanciesModel', vacanciesSchema.vacanciesSchema);
    this.itemsToSave = [];
  }

  async save(item) {
    return new Promise((resolve, reject) => {
      const vacancy = new this.model(item);
      vacancy.save((err, result) => {
        if (err) {
          reject();
          return logger.error('Ошибка записи данных!!!', err);
        }
        logger.info('документ успешно сохранен ');
        resolve();
      });
    });
  }


  async saveItems(items) {
    db.db.dropCollection('vacanciesmodels');

    try {
      for (let i = 0; i < items.length; i++) {
        try {
          await this.save(items[i]);
        } catch (error) {
          logger.error(`Ошибка в сохранении конкретного файла ${i}`, error);
        }
      }
      logger.info('Все документы успешно сохранены, закрываем соединение с базой');
      db.db.close();
    } catch (e) {
      logger.error('Общая ошибка при сохранении файлов', error);
    }
  }
}

const saver = new Vacancy();

module.exports = saver;
