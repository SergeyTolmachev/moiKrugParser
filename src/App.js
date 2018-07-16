// const log = require('winston');
const cron = require('cron');
const VacancyParser = require('./services/VacancyParser');
const httpsRequest = require('./utils/HttpsRequest');
const saver = require('./models/Vacancy');
const logger = require('./services/Logger');

class App {
  constructor() {
    this.itemsToSave = [];
  }

  async parseVacancy(url) {
    try {
      const data = await httpsRequest.getRequest(`https://moikrug.ru${url}`);
      try {
        const parsedPage = new VacancyParser(data).getData();
        parsedPage.lastId = url.replace('/vacancies/', '');
        this.itemsToSave.push(parsedPage);
        logger.info(`вакансия ${parsedPage.lastId}`);
      } catch (error) {
        logger.error('Ошибка в парсинге вакансии\n', error);
      }
    } catch (error) {
      logger.error('Ошибка в парсинге вакансии\n', error);
    }
  }


  async parsePages(page) {
    try {
      logger.info(`загружаем новус страницу ${page}`);
      const data = await httpsRequest.getRequest(`https://moikrug.ru/vacancies?page=${page}`);
      // if (this.itemsToSave.length >= 15) {
      //   saver.saveItems(this.itemsToSave);
      //   logger.info('-------------------------------');
      //   logger.info('------сохраняем все в базу------');
      //   logger.info('-------------------------------');
      //   return false;
      // }
      const items = VacancyParser.parsePageForLinks(data);

      if (!items.length) {
        logger.info('нет вакансий на странице');
        saver.saveItems(this.itemsToSave);
        return false;
      }
      for (let i = 0; i < items.length; i++) {
        await this.parseVacancy(items[i]);
      }
      await this.parsePages(page + 1);
    } catch (error) {
      logger.error('Ошибка в парсинге страницы\n', error);
    }
  }
}

const parser = new App();

parser.parsePages(1);
