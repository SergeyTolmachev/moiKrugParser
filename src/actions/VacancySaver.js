const logger = require('../Logger');
const vacancies = require('../models/vacancies');
const sequelize = require('../config/psqlConnect');


class VacancySaver {
  constructor() {
    this.itemsToSave = [];
  }


  async saveItems(items) {
    await vacancies.sync({ force: true })
      .then(() => logger.info('Таблица создана заново'))
      .catch(error => logger.error('Возникла ошибка с созданием таблицы', error));
    try {
      for (let i = 0; i < items.length; i++) {
        try {
          await vacancies.create(items[i]);
          logger.info(`Документ № ${i} успешно сохранен`);
        } catch (error) {
          logger.error(`Ошибка в сохранении конкретного файла ${i}`, error);
        }
      }
      logger.info('Все документы успешно сохранены');
      sequelize.close();
    } catch (e) {
      logger.error('Общая ошибка при сохранении файлов', error);
    }
  }
}

const saver = new VacancySaver();

module.exports = saver;
