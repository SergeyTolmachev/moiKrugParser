const mongoose = require('mongoose');

vacanciesSchema = mongoose.Schema({
    lastId: Number,
    title: String,
    skills: [{text: String, href: String}],
    date: Number,
    views: Number,
    salary: {
        salaryDown: String,
        salaryUp: String,
        currency: String
    },
    locationHref: String,
    location: String,
    companyLogo: String,
    companyHref: String,
    companyName: String,
    companyAbout: String,
    remote: Boolean,
    fullDay: Boolean,
    description: mongoose.Schema.Types.Mixed
});

module.exports.vacanciesSchema = vacanciesSchema;
