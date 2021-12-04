const express = require('express');
const path = require('path');
const multer = require('multer')
const bodParser = require('body-parser');
const mongoose = require('mongoose');
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user')
const session = require('express-session');
const flash = require('connect-flash')
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf')

const errorController = require('./controllers/error')

const CONNECTION_STRING = 'mongodb+srv://root:mumalo1993@cluster0.8iqum.mongodb.net/shop'


const app = express(); //express is a middleware
const store = new MongoDbStore({
    uri: CONNECTION_STRING,
    collection: 'sessions'
});

const csrfProtection = csrf();

app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toString() + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    console.log("File here is ", file)
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg')
    {
        console.log("Valid image added...")
        cb(null, true);
    } else {
        cb(null, false)
    }
}
app.use(bodParser.urlencoded({extended: false})); //register parser
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.use(csrfProtection);
app.use(flash())

app.use((req, res, next) => {
    if (!req.session.user) {
        console.log("No current user available...")
        return next()
    }

    User.findById(req.session.user._id)
        .then(user => {
            if (!user){
                return next()
            }
            req.user = user
            next()
        })
        .catch(err => {
            const error = new Error(err);
            console.log(err)
            next(error) //this is how u throw errors inside async code
        })
})

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})

//routes should be set after middle ware
app.use(express.static(path.join(__dirname, 'public')))
app.use("/images", express.static(path.join(__dirname, 'images')))
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.get('/500', errorController.get500)
app.use(errorController.get404)

app.use((error, req, res, next) => {
    console.log("Error occurred", error)
    res.redirect('/500')
})


mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log("Application started successfully...")
        app.listen(3000)
    })
    .catch(err => {
        console.log(err)
        throw new Error(err)
    })
