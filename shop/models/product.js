const getDb = require('../util/database').getDb;
const mongodb = require('mongodb')

class Product {
    constructor(title, price, description, imageUrl, id, userId) {
        this.title = title
        this.price = price
        this.description = description
        this.imageUrl = imageUrl
        this._id = id ? new mongodb.ObjectId(id) : null
        this.userId = userId
    }

    save(){
        const db = getDb()
        let dbOperation
        if (this._id){
            dbOperation = db
                .collection('products')
                .updateOne({_id: this._id}, {$set: this})
        } else {
            dbOperation = db
                .collection('products')
                .insertOne(this)
                .then(product => {
                    return product
                })
                .catch( err => console.log(err))
        }
        return dbOperation
    }

    static fetchAll(){
        const db = getDb()
        console.log("DB IN PRODUCTS IS ", db)
        return db.collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products)
                return products
            })
            .catch(err => console.log(err))
    }

    static findById(productId){
        const db = getDb()
        return db.collection('products')
            .find({_id: new mongodb.ObjectId(productId)})
            .next()
            .then(product => {
                console.log(product)
                return product;
            })
            .catch(err => console.log(err))
    }

    static deleteById(productId){
        const db = getDb()
        return db.collection('products')
            .deleteOne({_id: new mongodb.ObjectId(productId)})
            .then(result => {
                return result
            })
            .catch(err => console.log(err))
    }
}

module.exports = Product
