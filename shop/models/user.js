const mongoose = require('mongoose')
const mongodb = require('mongodb')

const Schema = mongoose.Schema
const Order = require('../models/order')

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    cart: {
        items: [{
            productId: {type: Schema.Types.ObjectId, ref: 'Product', required: true},
            quantity: {type: Number, required: true}
        }]
    }
})

//dont use arrow functions here because of the this keyword
userSchema.methods.addToCart = function (product){
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    });

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items]

    if (cartProductIndex >= 0){
        newQuantity = this.cart.items[cartProductIndex].quantity + 1;
        updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: +newQuantity
        });
    }

    this.cart = {
        items: updatedCartItems
    }
    return this.save()
}


userSchema.methods.clearCart = function (){
    this.cart = {items: []};
    return this.save()
}

userSchema.methods.removeFromCart = function (productId){
    this.cart.items = this.cart.items.filter(item => {
       return item.productId.toString() !== productId.toString()
   });
   this.save()
}

userSchema.addOrder = function () {
    const cartItems = this.cart
    const order = new Order({

    })
    // addOrder(){
    //     const db = getDb()
    //     return this.getCart()
    //         .then(products => {
    //             const order = {
    //                 items: products,
    //                 user: {
    //                     _id: new Object(this._id),
    //                     name: this.name,
    //                 },
    //             };
    //             return db.collection('orders').insertOne(order)
    //         })
    //         .then(result => {
    //             this.cart = {items: []}
    //             return db
    //                 .collection('users')
    //                 .updateOne(
    //                     {_id: this._id},
    //                     {$set: {cart: {items: []}}}
    //                 );
    //         })
    //
    // }
}

module.exports = mongoose.model("User", userSchema)

/*
class User {
    constructor(name, email, cart, id) {
        this.name = name
        this.email = email
        this.cart = cart //{items: []}
        this._id = id ? new mongodb.ObjectId(id) : null
    }

    save(){
        const db = getDb();
        return db.collection('users')
            .insertOne(this)
            .then(user => { return user })
            .catch(err => console.log(err));
    }

    deleteItemFromCart(productId){
        const updatedCartItems = this.cart.items.filter(item => {
            return item.productId.toString() !== productId.toString()
        });

        const db = getDb()
        return db.collection('users')
            .updateOne(
                {_id: this._id},
                {$set: {cart: {items: updatedCartItems}}}
            )
    }

    addOrder(){
        const db = getDb()
        return this.getCart()
            .then(products => {
                const order = {
                    items: products,
                    user: {
                        _id: new Object(this._id),
                        name: this.name,
                    },
                };
                return db.collection('orders').insertOne(order)
            })
            .then(result => {
                this.cart = {items: []}
                return db
                    .collection('users')
                    .updateOne(
                        {_id: this._id},
                        {$set: {cart: {items: []}}}
                    );
        })

    }

    getOrders(){
        const db = getDb()
        return db.collection('orders')
            .find({'user._id': new mongodb.ObjectId(this._id)})
            .toArray()
    }

    addToCart(product){
        const cartProductIndex = this.cart?.items?.findIndex(cp => {
            return cp.productId.toString() === product._id.toString()
        });

        let newQuantity = 1;
        const updatedCartItems = this.cart.items ? [...this.cart.items] : []

        if (cartProductIndex >= 0){
            newQuantity = this.cart.items[cartProductIndex].quantity + 1;
            updatedCartItems[cartProductIndex].quantity = newQuantity
        } else {
            updatedCartItems.push({
                productId: new mongodb.ObjectId(product._id),
                quantity: +newQuantity
            });
        }

        const db = getDb()
        const updatedCart = {
            items: updatedCartItems
        }

        return db.collection('users')
            .updateOne({_id: this._id}, {$set: {cart: updatedCart}})
            .then(updateResult => {
                return updateResult
            })
            .catch(err => console.log(err))
    }

    getCart(){
        const db = getDb()
        const productIds = this.cart.items.map(item => {
            return item.productId
        })
        //merge pr
        return db.collection('products')
            .find({_id: {$in: productIds}})
            .toArray()
            .then(products => {
                return products.map(p => {
                    return {...p,
                        quantity: this.cart.items.find(i => {
                        return i.productId.toString() === p._id.toString()
                    }).quantity
                    };
                });
            })
            .catch(err => console.log(err))
    }

    static findById(userId){
        const db = getDb();
        return db.collection('users')
           .findOne({_id: new mongodb.ObjectId(userId)}) //can use findOne
           .then(user => {
               return user
           })
           .catch(err => console.log(err));
    }
}

module.exports = User

 */
