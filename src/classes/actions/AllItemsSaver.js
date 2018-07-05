const db = require('../../config/mongodbConnect');
const Saver = require('../models/Vacancy');


class AllItemsSaver {
    saveItems(items) {
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
}

const allItemsSaver = new AllItemsSaver();

module.exports = allItemsSaver;
