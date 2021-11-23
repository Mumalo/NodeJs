const express = require('express');
const path = require('path')

const app = express(); //express is a middleware
app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const mongoose = require('mongoose')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodParser = require('body-parser');
const errorController = require('./controllers/error')
const User = require('./models/user')

app.use(bodParser.urlencoded({extended: false})); //register parser
app.use((req, res, next) => {
    User.findById('619c2340f98f670b35743ea6')
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404)

mongoose.connect('mongodb+srv://root:mumalo1993@cluster0.8iqum.mongodb.net/shop?retryWrites=true&w=majority')
    .then((connection) => {
        return User.findOne()
            .then(user => {
                if (!user){
                    console.log("Creating new user")
                    return new User({
                        name: "Justice Ticha",
                        email: "ticha.mumaj@gmail.com",
                        cart: {
                            items: []
                        }
                    }).save()
                }
            })
    }).
    then(() => {
        console.log("Application started successfully...")
        app.listen(3000)
    })
    .catch(err => console.log(err))
