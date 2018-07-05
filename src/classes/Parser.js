const VacancyParser = require('./VacancyParser');
const httpsRequest = require('./actions/HttpsRequest');
const allItemsSaver = require('./actions/AllItemsSaver');
const logger = require('./ErrorHandler');


class Parser {
    async parseVacancy(url) {
        try {
            let data = await httpsRequest.getRequest('https://moikrug.ru' + url);
            const parsedPage = new VacancyParser(data).getData();
            if (!parsedPage.falseOfParsing) {
                parsedPage.lastId = url.replace('/vacancies/', '');
                allItemsSaver.itemsToSave.push(parsedPage);
                console.log('вакансия ' + parsedPage.lastId);
            }
        } catch (error) {
            logger.logError('1', 'Ошибка в парсинге вакансии', error);
        }
    }


    async parsePages(page) {
        try {
            console.log('загружаем новус страницу ' + page);
            let data = await httpsRequest.getRequest('https://moikrug.ru/vacancies?page=' + page);
            if (allItemsSaver.itemsToSave.length >= 200) {
                allItemsSaver.saveItems(allItemsSaver.itemsToSave);
                console.log('-------------------------------');
                console.log('------сохраняем все в базу------');
                console.log('-------------------------------');
                return false;
            }
            const items = VacancyParser.parsePageForLinks(data);

            if (!items.length) {
                console.log('нет вакансий на странице');
                allItemsSaver.saveItems(allItemsSaver.itemsToSave);
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

let parser = new Parser();

module.exports = parser;

