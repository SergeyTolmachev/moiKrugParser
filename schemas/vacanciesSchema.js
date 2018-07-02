const mongoose = require('mongoose');

vacanciesSchema = mongoose.Schema({
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

module.exports.vacanciesSchema = vacanciesSchema;