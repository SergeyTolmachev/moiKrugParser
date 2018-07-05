const db = require('../config/mongodbConnect');
const VacancyParser = require('./VacancyParser');
const Saver = require('./models/Vacancy');
const httpsRequest = require('./actions/HttpsRequest');
const allItemsSaver = require('./actions/AllItemsSaver');


let itemsToSave = []; //массив объектов, которые сохраняются в базу


async function parseVacancy(urls, callback) {
    let url = urls.shift();
    let data = await httpsRequest.getRequest('https://moikrug.ru' + url);
    const parsedPage = new VacancyParser(data).getData();
    if (!parsedPage.falseOfParsing) {
        //console.log('DO: ' + url);
        parsedPage.lastId = url.replace('/vacancies/', '');
        //console.log('POSLE: '+ parsedPage.lastId);
        itemsToSave.push(parsedPage);
        console.log('вакансия ' + parsedPage.lastId);
    }
    if (urls.length === 0) {
        callback();
    } else {
        await parseVacancy(urls, callback);
    }
}


async function parsePages(page) {
    console.log('загружаем новус страницу ' + page);
    let data = await httpsRequest.getRequest('https://moikrug.ru/vacancies?page=' + page);
    if (itemsToSave.length >= 20) {
        allItemsSaver.saveItems(itemsToSave);
        console.log('-------------------------------');
        console.log('------сохраняем все в базу------');
        console.log('-------------------------------');
        return false;
    }
    const items = VacancyParser.parsePageForLinks(data);

    if (!items.length) {
        console.log('нет вакансий на странице');
        allItemsSaver.saveItems(itemsToSave);
        return false;
    }

    await parseVacancy(items, function () {
        return parsePages(page + 1);
    });

}




parsePages(1);
