const Sequelize = require('sequelize');
const sequelize = require('../config/psqlConnect');

const vacancies = sequelize.define('vacancies', {
  title: Sequelize.STRING,
  salary: Sequelize.JSONB,
  skills: Sequelize.JSONB,
  date: Sequelize.DATE,
  companyLogo: Sequelize.STRING,
  companyHref: Sequelize.STRING,
  companyName: Sequelize.STRING,
  companyAbout: Sequelize.STRING,
  views: Sequelize.INTEGER,
  location: Sequelize.STRING,
  description: Sequelize.JSONB,
  remote: Sequelize.STRING,
  fullDay: Sequelize.STRING,
  lastId: Sequelize.STRING,
});


module.exports = vacancies;
