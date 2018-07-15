const VacancyParser = require('./VacancyParser');
const httpsRequest = require('./actions/HttpsRequest');
const saver = require('./actions/VacancySaver');
const logger = require('./Logger');
const cron = require('cron');


class App {
  async parseVacancy(url) {
    try {
      const data = await httpsRequest.getRequest(`https://moikrug.ru${url}`);
      try {
        const parsedPage = new VacancyParser(data).getData();
        parsedPage.lastId = url.replace('/vacancies/', '');
        saver.itemsToSave.push(parsedPage);
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
      logger.info(`загружаем новую страницу ${page}`);
      const data = await httpsRequest.getRequest(`https://moikrug.ru/vacancies?page=${page}`);
      // if (saver.itemsToSave.length >= 15) {
      //   saver.saveItems(saver.itemsToSave);
      //   logger.info('-------------------------------');
      //   logger.info('------сохраняем все в базу------');
      //   logger.info('-------------------------------');
      //   return false;
      // }
      const items = VacancyParser.parsePageForLinks(data);

      if (!items.length) {
        logger.info('нет вакансий на странице');
        saver.saveItems(saver.itemsToSave);
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


const repeatParsing = new cron.CronJob({
    cronTime: '00 00,06,12,18 * * *',
    onTick: () => parser.parsePages(1),
    start: false,
});

//repeatParsing.start();


