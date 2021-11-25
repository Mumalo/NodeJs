const express = require('express');
const path = require('path')

const mongoose = require('mongoose')
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth')
const session = require('express-session')
const MongoDbStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error')
const User = require('./models/user')

const CONNECTION_STRING = 'mongodb+srv://root:mumalo1993@cluster0.8iqum.mongodb.net/shop'


const app = express(); //express is a middleware
const store = new MongoDbStore({
    uri: CONNECTION_STRING,
    collection: 'sessions'
});
app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const bodParser = require('body-parser');
app.use(bodParser.urlencoded({extended: false})); //register parser

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use((req, res, next) => {
    if (!req.session.user) return next()
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

//routes should be set after middle ware
app.use(express.static(path.join(__dirname, 'public')))
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.use(errorController.get404)

mongoose.connect(CONNECTION_STRING)
    .then(() => {
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
