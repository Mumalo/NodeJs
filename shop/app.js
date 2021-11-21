const express = require('express');
const path = require('path')

const app = express(); //express is a middleware
app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodParser = require('body-parser');
const errorController = require('./controllers/error')
const databaseUtils = require('./util/database')
const User = require('./models/user')

// const User = require('./models/user')

app.use(bodParser.urlencoded({extended: false})); //register parser
app.use((req, res, next) => {
    User.findById('619ac6a2a61bb71a257581a1')
        .then(user => {
            req.user = new User(user.name, user.email, user.cart, user._id)
            next()
        })
        .catch(err => console.log(err))
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404)

databaseUtils.mongoConnect(() => {
    console.log("Started application...")
    app.listen(3000)
})
