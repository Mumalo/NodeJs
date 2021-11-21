const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;
const mongoConnect = (callback) => {
    MongoClient.connect('mongodb+srv://root:mumalo1993@cluster0.8iqum.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log("Setting DB...")
            _db = client.db() //takes a database parameter db('test')
            callback()
            console.log("Connected...")
        })
        .catch(err => {
            console.error("error connecting", err)
            // throw err
        })
}

const getDb = () => {
    if (_db){
        return _db
    }

    throw new Error("No database found")

}

module.exports = mongoConnect
module.getDb = getDb

