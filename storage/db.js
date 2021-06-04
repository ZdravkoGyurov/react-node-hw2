const MongoClient = require('mongodb').MongoClient
const { ObjectID } = require("bson")
const dbUrl = "mongodb://localhost:27017"
const dbName = "cooking"
const collectionName = "users"

const client = new MongoClient(dbUrl, { useUnifiedTopology: true })

exports.connect = async (app) => {
    const conn = await client.connect()
    app.locals.collection = conn.db(dbName).collection(collectionName)
}

UPSERT_OPERATION = {
    INSERT: 0,
    UPDATE: 1
}


function isValidId(id) {
    return ObjectID.isValid(id)
}

module.exports.UPSERT_OPERATION = UPSERT_OPERATION
module.exports.isValidId = isValidId