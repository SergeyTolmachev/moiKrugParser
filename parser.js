const https = require('https');
let htmlparser = require("htmlparser");
let select = require('soupselect').select;
let mongoose = require('mongoose');


mongoose.connect('mongodb://dbuser:develop1992@ds261929.mlab.com:61929/firstdb');
// TODO убрать логины и пароли из коннекта

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('мы успешно подключились');
});


let vacanciesSchema = mongoose.Schema({
    lastId: Number,
    title: String,
    skills: [{text: String, href: String}],
    date: Number,
    views: Number,
    salary: {
        salaryDown: Number,
        salaryUp: Number,
        currency: String
    },
    locationHref: String,
    location: String,
    companyLogo: String,
    companyHref: String,
    companyName: String,
    companyAbout: String,
    description: mongoose.Schema.Types.Mixed
});


let vacanciesModel = mongoose.model('vacanciesModel', vacanciesSchema);

let falseOfParsing = false;

function insertIntoDatabase(item) {

    let vacancy = new vacanciesModel(item);
    vacancy.save(function (err, result) {
        if (err) return console.log('Ошибка записи данных!!!', err);
        console.log('документ успешно сохранен ');
    });
}


let handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error) {
        console.log('Возникла ошибка', error)
    }
    else {
        console.log('Парсинг прошел успешно')
    }
});


let parser = new htmlparser.Parser(handler);


function dateConvert(date) {
    let dateThings = date.split(' ');
    if (dateThings[1] == 'января') {
        dateThings[1] = '01'
    }
    if (dateThings[1] == 'февраля') {
        dateThings[1] = '02'
    }
    if (dateThings[1] == 'марта') {
        dateThings[1] = '03'
    }
    if (dateThings[1] == 'апреля') {
        dateThings[1] = '04'
    }
    if (dateThings[1] == 'мая') {
        dateThings[1] = '05'
    }
    if (dateThings[1] == 'июня') {
        dateThings[1] = '06'
    }
    if (dateThings[1] == 'июля') {
        dateThings[1] = '07'
    }
    if (dateThings[1] == 'августа') {
        dateThings[1] = '08'
    }
    if (dateThings[1] == 'сентября') {
        dateThings[1] = '09'
    }
    if (dateThings[1] == 'октября') {
        dateThings[1] = '10'
    }
    if (dateThings[1] == 'ноября') {
        dateThings[1] = '11'
    }
    if (dateThings[1] == 'декабря') {
        dateThings[1] = '12'
    }
    return Date.parse(dateThings[1] + '/' + dateThings[0] + '/' + dateThings[2]);
}


function getSalary(salary) {
    let salaryThings = {};
    salaryItems = salary.split(' ');
    if (salaryItems[0] == 'От') {
        salaryThings.salaryDown = salaryItems[1] + '' + salaryItems[2]
    }
    if (salaryItems[0] == 'До') {
        salaryThings.salaryUp = salaryItems[1] + '' + salaryItems[2]
    }
    if (salaryItems[3] == 'до') {
        salaryThings.salaryUp = salaryItems[4] + '' + salaryItems[5]
    }
    salaryThings.currency = salaryItems[salaryItems.length - 1];
    return salaryThings;
}


function checkRightParsing(item) {
    //console.log(JSON.stringify(item));
    if (typeof (item.title) != 'string') {
        falseOfParsing = true;
        console.log('ОШИБКА парсинга из-за:' + JSON.stringify(item.title));

    }
    if (typeof ( + item.lastId) != 'number') {
        falseOfParsing = true;
        console.log('ОШИБКА парсинга из-за:' + JSON.stringify(item.lastId));

    }
    if (item.description == '' || item.description == null || item.description == undefined) {
        falseOfParsing = true;
        console.log('ОШИБКА парсинга из-за:' + JSON.stringify(item.description));

    }
    if (typeof(item.date) != 'number') {
        falseOfParsing = true;
        console.log('ОШИБКА парсинга из-за:' + JSON.stringify(item.date));

    }
}

let jobsArr = [];


function parsePages(url) {
    let linkType = 'a';
    do {
        https.get(`https://moikrug.ru${url}`, (resp) => {
            console.log( `https://moikrug.ru${url}` );

            let data = '';
                resp.on('data', (chunk) => {
                    data += chunk;
                });
                resp.on('end', () => {
                    parser.parseComplete(data);
                    let pages = select(handler.dom, '.next_page');
                    console.log( JSON.stringify(pages) );
                    if (pages[0] && pages[0].href){
                        url = pages[0].href;
                        linkType = pages[0].name;
                    } else {
                        linkType = 'div';
                    }
                    let jobs = select(handler.dom, '.jobs');
                    jobs = select(jobs, '.title a');
                    jobsArr.push(jobs);
                });
                return 'все прошло успешно';
            }
        ).on("error", (err) => {
            console.log("Error: " + err.message);
        })
    } while (linkType == 'a')
}



function parseVacancy(url) {
    let item = {};
    item.lastId = url.replace('/vacancies/', '');
    console.log(item.lastId);
    https.get(`https://moikrug.ru/${url}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                parser.parseComplete(data);
                //console.log(handler.dom);
                let jobs = select(handler.dom, '.job_show_header');
                jobs = select(jobs, 'h1.title');
                item.title = jobs[0].children[0].data;
                jobs = select(handler.dom, '.skills a');
                let skills = new Array();
                jobs.forEach(function (skill, i, jobs) {
                    let oneSkill = {};
                    oneSkill.text = skill.children[0].data;
                    oneSkill.href = skill.attribs.href;
                    skills.push(oneSkill);
                });
                item.skills = skills;
                jobs = select(handler.dom, '.date');
                item.date = dateConvert(jobs[0].children[0].data.replace('&bull;', ''));
                jobs = select(handler.dom, '.views');
                jobs = jobs[0].children[0].data.split(' ');
                item.views = jobs[0];
                jobs = select(handler.dom, '.salary');

                if (jobs && jobs[0] && jobs[0].children[0]) {
                    let salary = getSalary(jobs[0].children[0].data);
                    item.salary = salary;
                } else {
                    let salary = {
                        salaryDown: undefined,
                        salaryUp: undefined,
                        currency: undefined
                    };
                    item.salary = salary;
                }


                jobs = select(handler.dom, '.location');

                if (jobs && jobs[0] && jobs[0].children[0] && jobs[0].children[0].children[0]) {
                    item.locationHref = jobs[0].children[0].attribs.href;
                    //console.log(item.locationHref);
                    item.location = jobs[0].children[0].children[0].data;
                } else {
                    item.location = undefined;
                }

                jobs = select(handler.dom, '.logo');


                if (jobs && jobs[0] && jobs[0].children[0]) {
                    item.companyLogo = jobs[0].children[0].attribs.src;
                    item.companyHref = jobs[0].attribs.href;
                    //console.log(item.companyHref);
                } else {
                    item.companyLogo = undefined;
                    item.companyHref = undefined;
                }

                jobs = select(handler.dom, '.company_name');

                if (jobs && jobs[0] && jobs[0].children[0] && jobs[0].children[0].children[0]) {
                    item.companyName = jobs[0].children[0].children[0].data;
                    //console.log(item.companyName);
                } else {
                    item.companyName = undefined;
                }


                jobs = select(handler.dom, '.company_about');

                if (jobs && jobs[0] && jobs[0].children[0]) {
                    item.companyAbout = jobs[0].children[0].data;
                    //console.log(item.companyAbout);
                } else {
                    item.companyAbout = undefined;
                }

                jobs = select(handler.dom, '.vacancy_description');
                item.description = jobs[0];
                //console.log(JSON.stringify(item));
                checkRightParsing(item);
                itemsToSave.push(item);
            });
            return item;
        }
    ).on("error", (err) => {
        console.log("Error: " + err.message);
    })
}


let itemsToSave = [];

https.get('https://moikrug.ru/vacancies', (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        parser.parseComplete(data);

        //parsePages('vacancies');

        //console.log(handler.dom);
        //
        let jobs = select(handler.dom, '.jobs');

        jobs = select(jobs, '.title a');


        let intervalTimer = Math.floor(Math.random() * 500) + 1850;
        jobs.forEach(function (item, i, jobs) {
            intervalTimer = intervalTimer + Math.floor(Math.random() * 500) + 1850;
            setTimeout(function () {
                parseVacancy(item.attribs.href);
            }, intervalTimer);
        });
        setTimeout(function () {
            if (falseOfParsing === false) {
                db.dropCollection('vacanciesmodels', function (err, result) {
                });
                itemsToSave.forEach(function (item, i, itemsToSave) {
                    console.log(JSON.stringify(itemsToSave[i]));
                    insertIntoDatabase(item);
                });
                setTimeout(function () {
                    db.close();
                }, 2000);
            } else {
                db.close();
                console.log('ВНИМАНИЕ!!! ВОЗНИКЛА ОШИБКА ПАРСИНГА!!!')
            }
        }, intervalTimer + 2000);

    });
    return 'Все прошло ОК';
    //console.log(jobsArr);
}).on("error", (err) => {
    console.log("Error: " + err.message);
});