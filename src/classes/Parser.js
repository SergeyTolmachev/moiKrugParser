const https = require('https');
const db = require('../config/mongodbConnect');
const VacancyParser = require('./VacancyParser');
const Saver = require('./models/Vacancy');


let itemsToSave = []; //массив объектов, которые сохраняются в базу


function httpsRequest(url) {
    return new Promise(function (resolve, reject) {
        const intervalTimer = Math.floor(Math.random() * 100) + 600;
        setTimeout(function () {
            https.get((url), resp => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    resolve(data);
                });
            }).on("error", (error) => {
                reject(error);
            })

        }, intervalTimer);
    });
}

async function parseVacancy(urls, callback) {
    let url = urls.shift();
    let data = await httpsRequest('https://moikrug.ru' + url);
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
    let data = await httpsRequest('https://moikrug.ru/vacancies?page=' + page);
    if (itemsToSave.length >= 20) {
        saveItems(itemsToSave);
        console.log('-------------------------------');
        console.log('------сохраняем все в базу------');
        console.log('-------------------------------');
        return false;
    }
    const items = VacancyParser.parsePageForLinks(data);

    if (!items.length) {
        console.log('нет вакансий на странице');
        saveItems(itemsToSave);
        return false;
    }

    parseVacancy(items, function () {
        return parsePages(page + 1);
    });

}

function saveItems(items) {
    db.db.dropCollection('vacanciesmodels', function (err, result) {
    });
    Promise.all(items.map(item => Saver.save(item)))
        .then(function () {
            console.log('all documents succesfully saved!');
            db.db.close();
        })
        .catch(() => {
            console.log('error with saving');
        });

}


parsePages(1);
