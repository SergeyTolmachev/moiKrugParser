const htmlparser = require("htmlparser");
const select = require('soupselect').select;


let handler = new htmlparser.DefaultHandler(function (error, dom) {
    if (error) {
        console.log('Возникла ошибка', error)
    }
    else {
        console.log('Парсинг прошел успешно')
    }
});

let vacancyParser = new htmlparser.Parser(handler);

class VacancyParser {

    static parsePageForLinks(data) {

        let vacancyParser = new htmlparser.Parser(handler);

        vacancyParser.parseComplete(data);

        const jobsDom = select(handler.dom, '.jobs');
        const jobsLinks = select(jobsDom[0], '.title a');
        return jobsLinks.map(function (item) {
            return item.attribs.href;
        });
    }

    static dateConvert(date) {
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

    static getSalary(salary) {
        let salaryThings = {};
        const salaryItems = salary.split(' ');
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

    constructor(data) {
        vacancyParser.parseComplete(data);
        this.dom = handler.dom;
        this.data = {};

        this.initParse();
    }

    checkRightParsing() {
        if (typeof (this.data.title) != 'string') {
            this.data.falseOfParsing = true;
        }
        if (typeof ( + this.data.lastId) != 'number') {
            this.data.falseOfParsing = true;
        }
        if (this.data.description == '' || this.data.description == null || this.data.description == undefined) {
            this.data.falseOfParsing = true;
        }
        if (typeof(this.data.date) != 'number') {
            this.data.falseOfParsing = true;
        }
    }

    getData() {
        return this.data;
    }

    parseTitle() {
        let headerDom = select(handler.dom, '.job_show_header');
        let titleDom = select(headerDom, 'h1.title');
        this.data.title = titleDom[0].children[0].data;
    }


    parseDate() {
        let dateDom = select(handler.dom, '.date');
        this.data.date = VacancyParser.dateConvert(dateDom[0].children[0].data.replace('&bull;', ''));
    }


    parseSkills() {
        const skillsDom = select(handler.dom, '.skills a');
        let skills = new Array();
        skillsDom.forEach(function (skill) {
            let oneSkill = {};
            oneSkill.text = skill.children[0].data;
            oneSkill.href = skill.attribs.href;
            skills.push(oneSkill);
        });
        this.data.skills = skills;
    }

    parseViews() {
        let viewsDom = select(handler.dom, '.views');
        let views = viewsDom[0].children[0].data.split(' ');
        this.data.views = views[0];
    }





    parseSalary() {
        const footerDom = select(handler.dom, '.footer_meta');
        const salaryDom = select(footerDom, '.salary');

        let salary = {
            salaryDown: undefined,
            salaryUp: undefined,
            currency: undefined
        };

        if (salaryDom && salaryDom[0] && salaryDom[0].children[0]) {
            salary = VacancyParser.getSalary(salaryDom[0].children[0].data);
        }

        this.data.salary = salary;
    }

    parseLocation(){
        const footerDom = select(handler.dom, '.footer_meta');
        const locationDom = select(footerDom, '.location');

        if (locationDom && locationDom[0] && locationDom[0].children[0]) {
            this.data.location = locationDom[0].children[0].data;
        } else {
            this.data.location = undefined;
        }

    }


    parseCompany(){
        let logoDom = select(handler.dom, '.logo');

        if (logoDom && logoDom[0] && logoDom[0].children[0]) {
            this.data.companyLogo = logoDom[0].children[0].attribs.src;
            this.data.companyHref = logoDom[0].attribs.href;
        } else {
            this.data.companyLogo = undefined;
            this.data.companyHref = undefined;
        }


        let companyNameDom = select(handler.dom, '.company_name');

        if (companyNameDom && companyNameDom[0] && companyNameDom[0].children[0] && companyNameDom[0].children[0].children[0]) {
            this.data.companyName = companyNameDom[0].children[0].children[0].data;
        } else {
            this.data.companyName = undefined;
        }


        let companyAboutDom = select(handler.dom, '.company_about');

        if (companyAboutDom && companyAboutDom[0] && companyAboutDom[0].children[0]) {
            this.data.companyAbout = companyAboutDom[0].children[0].data;
        } else {
            this.data.companyAbout = undefined;
        }

    }


    parseDescripton() {
        let descriptonDom = select(handler.dom, '.vacancy_description');
        this.data.description = descriptonDom[0];
    }

    initParse() {
        try {
            this.data.falseOfParsing = false;
            this.parseTitle();
            this.parseSkills();
            this.parseDate();
            this.parseCompany();
            this.parseSalary();
            this.parseViews();
            this.parseLocation();
            this.parseDescripton();
            this.checkRightParsing();
        } catch(e) {
            this.data.falseOfParsing = true;
        }
    }


}



module.exports = VacancyParser;