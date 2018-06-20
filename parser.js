const https = require('https');
let htmlparser = require("htmlparser");
let select = require('soupselect').select;
let mongoose = require('mongoose');


mongoose.connect('mongodb://admin:fantomas17@ds261929.mlab.com:61929/firstdb');

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log('мы успешно подключились');
});


let vacanciesSchema = mongoose.Schema({
    title: String,
    salaryDown: Number,
    salaryUp: Number,
    currency: String
});

let vacanciesModel = mongoose.model('vacanciesModel', vacanciesSchema);

function insertIntoDatabase(arr){
    arr.forEach(function(item, i ,arr){
        if (item.salaryUp !== undefined){
            item.salaryUp = +item.salaryUp.split(' ').join('');
        } else {
            item.salaryUp = 0;
        }
        if (item.salaryDown !== undefined){
            item.salaryDown = +item.salaryDown.split(' ').join('');
        } else {
            item.salaryDown = 0;
        }

        let vacancy = new vacanciesModel(item);
        //console.log(arr);
        vacancy.save(function (err, result) {
            if (err) return console.log('Ошибка записи данных!!!', err);
            console.log('документ успешно сохранен ' + i);
        });
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

https.get('https://moikrug.ru/vacancies', (resp) => {
    let data = '';
    resp.on('data', (chunk) => {
        data += chunk;
    });
    resp.on('end', () => {
        parser.parseComplete(data);
        let jobs = select(handler.dom, '.jobs');
        let jobsArr = jobs[0].children.map(job => {
            const salary = select(job, '.salary')[0].children;
            const salaryArr = salary ? salary[0].children.map((item, index) => {
                const elem = item.children ? item.children[0] : item;
                return elem.data;
            }) : undefined
            return {
                title: select(job, '.title')[0].children[0].children[0].data,
                salaryDown: salaryArr ? (salaryArr[0].indexOf('От') !== -1 ? salaryArr[1] : undefined) : undefined,
                salaryUp: salaryArr ? (salaryArr[0].indexOf('До') !== -1 ? salaryArr[1] : salaryArr[2].indexOf('до') !==-1 ? salaryArr[3] : undefined) : undefined,
                currency: salaryArr ? (salaryArr[salaryArr.length - 1]) : undefined,
            };
        });
        //console.log(jobsArr);
        insertIntoDatabase(jobsArr);
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});