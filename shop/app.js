const express = require('express');
const path = require('path')

const app = express(); //express is a middleware
app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const adminRoutes = require('./routes/admin');
// const shopRoutes = require('./routes/shop');

const bodParser = require('body-parser');
const errorController = require('./controllers/error')
const mongoConnect = require('./util/database')

// const User = require('./models/user')

app.use(bodParser.urlencoded({extended: false})); //register parser
app.use((req, res, next) => {
    // User.findByPk(1).then(user => {
    //     req.user = user;
    //     next();
    // })
})
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
// app.use(shopRoutes);


app.use(errorController.get404)

mongoConnect(() => {
    console.log("Started application...")
    app.listen(3000)
})
