const https = require('https');
const htmlparser = require("htmlparser");
const select = require('soupselect').select;
const mongoose = require('mongoose');
const vacanciesSchema = require('./schemas/vacanciesSchema');
const db = require('./config/mongodbConnect');
const Parser = require('./src/Classes/VacancyParser');
const Saver = require('./src/Classes/Models/Vacancy');


function parseVacancy(url) {
    let itemReturn = {};
    let parser = new htmlparser.Parser(handler);
    https.get(`https://moikrug.ru/${url}`, (resp) => {
            let data = '';
            resp.on('data', (chunk) => {
                data += chunk;
            });
            resp.on('end', () => {
                parser.parseComplete(data);
                let item = {};
                item.lastId = url.replace('/vacancies/', '');
                console.log(item.lastId);
                //console.log(handler.dom);
                let jobs = select(handler.dom, '.job_show_header');
                jobs = select(jobs, 'h1.title');
                item.title = jobs[0].children[0].data;
                console.log(item.title);
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


                const footerDom = select(handler.dom, '.footer_meta');
                const salaryDom = select(footerDom, '.salary');

                let salary;

                if (salaryDom && salaryDom[0] && salaryDom[0].children[0]) {
                    salary = getSalary(salaryDom[0].children[0].data);
                    item.salary = salary;
                    console.log(salaryDom[0].children[0].data + ' ' + JSON.stringify(item.salary));
                } else {
                    salary = {
                        salaryDown: undefined,
                        salaryUp: undefined,
                        currency: undefined
                    };
                    item.salary = salary;
                    console.log('зарплата не определена' + JSON.stringify(item.salary));
                }


                const locationDom = select(footerDom, '.location');

                if (locationDom && locationDom[0] && locationDom[0].children[0]) {
                    item.location = locationDom[0].children[0].data;
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
                itemReturn = item;
                checkRightParsing(item);
                itemsToSave.push(item);
            });
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
        let parser = new htmlparser.Parser(handler);
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
                db.db.dropCollection('vacanciesmodels', function (err, result) {
                });
                itemsToSave.forEach(function (item, i, itemsToSave) {
                    //console.log(JSON.stringify(itemsToSave[i]));
                    insertIntoDatabase(item);
                });
                setTimeout(function () {
                    db.db.close();
                }, 2000);
            } else {
                db.db.close();
                console.log('ВНИМАНИЕ!!! ВОЗНИКЛА ОШИБКА ПАРСИНГА!!!')
            }
        }, intervalTimer + 2000);

    });
    return 'Все прошло ОК';
    //console.log(jobsArr);
}).on("error", (err) => {
    console.log("Error: " + err.message);
});