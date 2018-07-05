const VacancyParser = require('./VacancyParser');
const httpsRequest = require('./actions/HttpsRequest');
const allItemsSaver = require('./actions/AllItemsSaver');


class Parser {
    async parseVacancy(url) {
        let data = await httpsRequest.getRequest('https://moikrug.ru' + url);
        const parsedPage = new VacancyParser(data).getData();
        if (!parsedPage.falseOfParsing) {
            //console.log('DO: ' + url);
            parsedPage.lastId = url.replace('/vacancies/', '');
            //console.log('POSLE: '+ parsedPage.lastId);
            allItemsSaver.itemsToSave.push(parsedPage);
            console.log('вакансия ' + parsedPage.lastId);
        }
    }


    async parsePages(page) {
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

        console.log('length ' + items.length);


        for (let i = 0; i < items.length; i++){
            await this.parseVacancy(items[i]);
        }

        console.log('начинаем следюстраницу');

        await this.parsePages(page + 1);

        console.log('заканчиваем следюстраница');

    }
}

let parser = new Parser();

module.exports = parser;

