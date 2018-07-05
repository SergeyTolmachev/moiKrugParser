const https = require('https');
const db = require('./config/mongodbConnect');
const VacancyParser = require('./src/Classes/VacancyParser');
const Saver = require('./src/Classes/Models/Vacancy');


let itemsToSave = []; //массив объектов, которые сохраняются в базу



function parseVacancy(urls, callback) {

        const intervalTimer = Math.floor(Math.random() * 100) + 600;
        setTimeout(function () {
            let url = urls.shift();
            https.get(`https://moikrug.ru${url}`, resp => {
                let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
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
                        parseVacancy(urls, callback);
                    }
                });
            }).on("error", (err) => {
                console.log("Error: " + err.message);
                if (urls.length === 0) {
                    callback();
                } else {
                    parseVacancy(urls, callback);
                }
            })

        }, intervalTimer);

}




function parsePages(page){
    console.log('загружаем новус страницу ' + page);
    https.get('https://moikrug.ru/vacancies?page=' + page, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            if (itemsToSave.length >= 200) {
                saveItems(itemsToSave);
                console.log('-------------------------------');
                console.log('------сохраняем все в базу------');
                console.log('-------------------------------');
                return false;
            }
            const items = VacancyParser.parsePageForLinks(data);

            if (!items.length){
                console.log('нет вакансий на странице');
                saveItems(itemsToSave);
                return false;
            }

            parseVacancy(items, function () {
                return parsePages(page + 1);
            });

        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });

}

function saveItems(items){
    db.db.dropCollection('vacanciesmodels', function (err, result) {});
    Promise.all(items.map(item => Saver.save(item)))
        .then(function(){
            console.log('all documents succesfully saved!');
            db.db.close();
        })
        .catch(()=> {
            console.log('error with saving');
        });

}



parsePages(1);