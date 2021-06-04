const { ObjectID } = require("bson")
const { UPSERT_OPERATION } = require("./db")

async function createUser(collection, user) {
    const insertResult = await collection.insertOne(user)
    if (insertResult.result.ok && insertResult.insertedCount === 1) {
        delete user._id
        user.id = insertResult.insertedId
        return user
    } else {
        throw Error('failed to insert user in the database')
    }
}

async function readUsers(collection) {
    const users = await collection.find().toArray()
    return users.map(u => {
        u.id = u._id
        delete u._id
        return u
    })
}

async function readUser(collection, id) {
    const user = await collection.findOne({ _id: new ObjectID(id) })
    if (!user) {
        throw Error(`user with id: ${id} does not exist`)
    }
    user.id = user._id
    delete user._id
    return user
}

async function deleteUser(collection, id) {
    const deleteResult = await collection.deleteOne({ _id: new ObjectID(id) })
    if (!deleteResult.result.ok) {
        throw Error('failed to delete user from the database')
    }
}

async function upsertUser(collection, id, user) {
    delete user._id

    const upsertResult = await collection.updateOne(
        { _id: new ObjectID(id) },
        { $set: user },
        { upsert: true }
    );
    if (!upsertResult.result.ok) {
        throw Error('failed to upsert user in the database')
    }

    user.id = id

    if (upsertResult.result.nModified === 0 && upsertResult.result.upserted) {
        return UPSERT_OPERATION.INSERT
    }
    return UPSERT_OPERATION.UPDATE
}

module.exports.createUser = createUser
module.exports.readUsers = readUsers
module.exports.readUser = readUser
module.exports.upsertUser = upsertUser
module.exports.deleteUser = deleteUser