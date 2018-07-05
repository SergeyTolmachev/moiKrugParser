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

class PageParser {

    constructor(data) {
        vacancyParser.parseComplete(data);
        this.dom = handler.dom;
        this.data = {};
        this.initParse();
    }


    getData() {
        return this.data;
    }

    initParse() {

    }


}



module.exports = PageParser;