const express = require('express');
const path = require('path')

const app = express(); //express is a middleware
const db = require('./util/databaseOld')
//const expressHds = require('express-handlebars')

//app.engine('hbs', expressHds({layoutsDir: 'views/layouts', defaultLayout: 'main'}))
//app.set('view engine', 'hbs') //template engine to use
app.set('view engine', 'ejs') //template engine to use
app.set('views', 'views') //where to find views

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const bodParser = require('body-parser');
const errorController = require('./controllers/error')
const sequelize = require('./util/database')

const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-item')
const Order = require('./models/order')
const OrderItem = require('./models/order-item')

app.use(bodParser.urlencoded({extended: false})); //register parser
app.use((req, res, next) => {
    User.findByPk(1).then(user => {
        req.user = user;
        next();
    })
})
app.use(express.static(path.join(__dirname, 'public')))

app.use('/admin', adminRoutes);
app.use(shopRoutes);


app.use(errorController.get404)


Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'})
User.hasMany(Product)
User.hasOne(Cart)
Cart.belongsTo(User)
Cart.belongsToMany(Product, {through: CartItem})
Product.belongsToMany(Cart, {through: CartItem})
Order.belongsTo(User)
User.hasMany(Order)
Order.belongsToMany(Product, {through: OrderItem})

// {force: true} to recreate tables
sequelize.sync().then(() => {
    User.findByPk(1).then(user => {
        if (!user){
            return User.create({name: 'Max', email: 'user@gmail.com'})
        }
        return Promise.resolve(user)
    }).then(user => {
        user.createCart()
        console.log(user)
    }).then(() => {
        app.listen(3000)
    })
}).catch(err => {
    console.log(err)
})
