const Sequelize = require('sequelize')

const sequelize = new Sequelize('shop', 'root', 'mumalo1993', {
    dialect: 'mysql',
    host: 'localhost'
});

module.exports = sequelize;
