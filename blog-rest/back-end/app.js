const express = require('express');
const bodyParser = require('body-parser');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const mongoose = require('mongoose');
const CONNECTION_STRING = 'mongodb+srv://root:mumalo1993@cluster0.8iqum.mongodb.net/messages'
const path = require('path');
const multer = require('multer')


const app = express();

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})


const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        console.log('Mime type correct')
        cb(null, true);
    } else {
        console.log('Mime type wrong');
        console.log(file.mimetype)
        cb(null, false);
    }
}
app.use(bodyParser.json()); // good for application/json

app.use(
    multer({storage: fileStorage, fileFilter: fileFilter}).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

//allow access to many clients
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next()
})


app.use('/feed', feedRoutes)
app.use('/auth', authRoutes)


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data || [];
    res.status(status).json({ message: message, data: data });
})

mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log("Application started successfully...")
        const server = app.listen(8080)
        const io = require('./socket').init(server);
        io.on("connection", socket => {
          console.log("Client connected")
        });

        io.on("connect_error", err => {
            console.log(`connect_error due to ${err.message}`);
        })

    })
    .catch(err => {
        console.log(err)
        throw new Error(err)
    })
