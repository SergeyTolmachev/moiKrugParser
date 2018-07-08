const VacancyParser = require('./VacancyParser');
const httpsRequest = require('./actions/HttpsRequest');
const saver = require('./models/Vacancy');
const logger = require('./ErrorHandler');


class App {
  async parseVacancy(url) {
    try {
      const data = await httpsRequest.getRequest(`https://moikrug.ru${url}`);
      const parsedPage = new VacancyParser(data).getData();
      if (!parsedPage.falseOfParsing) {
        parsedPage.lastId = url.replace('/vacancies/', '');
        saver.itemsToSave.push(parsedPage);
        console.log(`вакансия ${parsedPage.lastId}`);
      }
    } catch (error) {
      logger.logError('1', 'Ошибка в парсинге вакансии', error);
    }
  }


  async parsePages(page) {
    try {
      console.log(`загружаем новус страницу ${page}`);
      const data = await httpsRequest.getRequest(`https://moikrug.ru/vacancies?page=${page}`);
      if (saver.itemsToSave.length >= 15) {
        saver.saveItems(saver.itemsToSave);
        console.log('-------------------------------');
        console.log('------сохраняем все в базу------');
        console.log('-------------------------------');
        return false;
      }
      const items = VacancyParser.parsePageForLinks(data);

      if (!items.length) {
        console.log('нет вакансий на странице');
        saver.saveItems(saver.itemsToSave);
        return false;
      }


      for (let i = 0; i < items.length; i++) {
        await this.parseVacancy(items[i]);
      }


      await this.parsePages(page + 1);
    } catch (error) {
      logger.logError('2', 'Ошибка в парсинге страницы', error);
    }
  }
}

const parser = new App();

parser.parsePages(1);
