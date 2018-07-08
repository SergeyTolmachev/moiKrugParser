const htmlparser = require('htmlparser');
const select = require('soupselect').select;
const logger = require('./ErrorHandler');


const handler = new htmlparser.DefaultHandler(((error, dom) => {
  if (error) {
    logger.logError('3', 'Возникла ошибка в парсинге', error);
  } else {
    // console.log('Парсинг прошел успешно')
  }
}));

const vacancyParser = new htmlparser.Parser(handler);

class VacancyParser {
  static parsePageForLinks(data) {
    const vacancyParser = new htmlparser.Parser(handler);

    vacancyParser.parseComplete(data);

    const jobsDom = select(handler.dom, '.jobs');
    const jobsLinks = select(jobsDom[0], '.title a');
    return jobsLinks.map(item => item.attribs.href);
  }

  static dateConvert(date) {
    const dateThings = date.split(' ');
    const monthsArray = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    if (monthsArray.indexOf(dateThings[1]) === -1) {
      dateThings[1] = '01';
    } else {
      dateThings[1] = monthsArray.indexOf(dateThings[1]) + 1;
    }
    return Date.parse(`${dateThings[1]}/${dateThings[0]}/${dateThings[2]}`);
  }

  static getSalary(salary) {
    const salaryThings = {
      salaryDown: null,
      salaryUp: null,
      currency: null,
    };
    const salaryItems = salary.split(' ');
    if (salaryItems[0] == 'От') {
      salaryThings.salaryDown = `${salaryItems[1]}${salaryItems[2]}`;
    }
    if (salaryItems[0] == 'До') {
      salaryThings.salaryUp = `${salaryItems[1]}${salaryItems[2]}`;
    }
    if (salaryItems[3] == 'до') {
      salaryThings.salaryUp = `${salaryItems[4]}${salaryItems[5]}`;
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
    if (typeof (this.data.title) !== 'string') {
      this.data.falseOfParsing = true;
    }
    if (typeof (+this.data.lastId) !== 'number') {
      this.data.falseOfParsing = true;
    }
    if (this.data.description == '' || this.data.description == null || this.data.description == undefined) {
      this.data.falseOfParsing = true;
    }
    if (typeof (this.data.date) !== 'number') {
      this.data.falseOfParsing = true;
    }
  }

  getData() {
    return this.data;
  }

  parseTitle() {
    const headerDom = select(handler.dom, '.job_show_header');
    const titleDom = select(headerDom, 'h1.title');
    this.data.title = titleDom[0].children[0].data;
  }


  parseDate() {
    const dateDom = select(handler.dom, '.date');
    this.data.date = VacancyParser.dateConvert(dateDom[0].children[0].data.replace('&bull;', ''));
  }


  parseSkills() {
    const skillsDom = select(handler.dom, '.skills a');
    const skills = new Array();
    skillsDom.forEach((skill) => {
      const oneSkill = {};
      oneSkill.text = skill.children[0].data;
      oneSkill.href = skill.attribs.href;
      skills.push(oneSkill);
    });
    this.data.skills = skills;
  }

  parseViews() {
    const viewsDom = select(handler.dom, '.views');
    const views = viewsDom[0].children[0].data.split(' ');
    this.data.views = views[0];
  }


  parseSalary() {
    const footerDom = select(handler.dom, '.footer_meta');
    const salaryDom = select(footerDom, '.salary');

    let salary = {
      salaryDown: null,
      salaryUp: null,
      currency: null,
    };

    this.data.salary = salary;

    if (salaryDom && salaryDom[0] && salaryDom[0].children[0]) {
      salary = VacancyParser.getSalary(salaryDom[0].children[0].data);
      this.data.salary = salary;
    }

    console.log(this.data.salary);
  }

  parseLocation() {
    const footerDom = select(handler.dom, '.footer_meta');
    const locationDom = select(footerDom, '.location');

    if (locationDom && locationDom[0] && locationDom[0].children[0]) {
      this.data.location = locationDom[0].children[0].data;
    } else {
      this.data.location = undefined;
    }
  }


  parseRemote() {
    const footerDom = select(handler.dom, '.footer_meta');
    const remoteDom = select(footerDom, '.ready_to_remote');

    if (remoteDom[0] && remoteDom[0].children[0]) {
      if (remoteDom[0].children[0].data.indexOf('Можно удаленно') != -1) {
        this.data.remote = true;
      } else {
        this.data.remote = false;
      }


      if (remoteDom[0].children[0].data.indexOf('Полный рабочий день') != -1) {
        this.data.fullDay = true;
      } else {
        this.data.fullDay = false;
      }
    }
  }


  parseCompany() {
    const logoDom = select(handler.dom, '.logo');

    if (logoDom && logoDom[0] && logoDom[0].children[0]) {
      this.data.companyLogo = logoDom[0].children[0].attribs.src;
      this.data.companyHref = logoDom[0].attribs.href;
    } else {
      this.data.companyLogo = undefined;
      this.data.companyHref = undefined;
    }


    const companyNameDom = select(handler.dom, '.company_name');

    if (companyNameDom && companyNameDom[0] && companyNameDom[0].children[0] && companyNameDom[0].children[0].children[0]) {
      this.data.companyName = companyNameDom[0].children[0].children[0].data;
    } else {
      this.data.companyName = undefined;
    }


    const companyAboutDom = select(handler.dom, '.company_about');

    if (companyAboutDom && companyAboutDom[0] && companyAboutDom[0].children[0]) {
      this.data.companyAbout = companyAboutDom[0].children[0].data;
    } else {
      this.data.companyAbout = undefined;
    }
  }


  parseDescripton() {
    const descriptonDom = select(handler.dom, '.vacancy_description');
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
      this.parseRemote();
    } catch (error) {
      logger.logError('4', 'Ошибка в обработке данных парсинга', error);
      this.data.falseOfParsing = true;
    }
  }
}


module.exports = VacancyParser;
