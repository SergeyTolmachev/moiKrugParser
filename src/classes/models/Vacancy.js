const mongoose = require('mongoose');
const vacanciesSchema = require('../../schemas/vacanciesSchema');



class Vacancy {
    constructor() {
        this.model = mongoose.model('vacanciesModel', vacanciesSchema.vacanciesSchema);
    }

    save(item){
        return new Promise((resolve, reject) => {
            let vacancy = new this.model(item);
            vacancy.save(function (err, result) {
                if (err) {
                    reject();
                    return console.log('Ошибка записи данных!!!', err);
                }
                console.log('документ успешно сохранен ');
                resolve();
            });
        });
    }


}

const saver = new Vacancy();

module.exports = saver;
