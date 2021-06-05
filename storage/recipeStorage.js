const { ObjectID } = require("bson")
const { UPSERT_OPERATION } = require("./db")

async function createRecipe(collection, userId, recipe) {
    recipe.id = new ObjectID()
    const insertResult = await collection.updateOne(
        { _id: new ObjectID(userId) },
        { $push: { recipes: recipe } }
    )
    if (insertResult.result.ok && insertResult.modifiedCount === 1) {
        return recipe
    } else {
        throw Error('failed to insert recipe in the database')
    }
}

async function readRecipes(collection, userId) {
    const user = await collection.findOne({ _id: new ObjectID(userId) })
    if (!user) {
        throw Error(`user with id: ${userId} does not exist`)
    }
    const recipes = user.recipes
    return recipes
}

async function readRecipe(collection, userId, recipeId) {
    const recipeObjectId = new ObjectID(recipeId)
    const user = await collection.findOne({ _id: new ObjectID(userId), recipes: { $elemMatch: { id: recipeObjectId } } })
    if (!user) {
        throw Error(`recipe with userId: ${userId} and id: ${recipeId} does not exist`)
    }
    for (let i = 0; i < user.recipes.length; i++) {
        if (recipeObjectId.equals(user.recipes[i].id)) {
            return user.recipes[i]
        }
    }
}

async function deleteRecipe(collection, userId, recipeId) {
    const deleteResult = await collection.updateOne(
        { _id: new ObjectID(userId) },
        { $pull: { recipes: { id: new ObjectID(recipeId) } } }
    )
    if (!deleteResult.result.ok) {
        throw Error('failed to delete recipe from the database')
    }
}

async function updateRecipe(collection, userId, recipeId, recipe) {
    const recipeObjectId = new ObjectID(recipeId)
    const upsertResult = await collection.updateOne(
        { _id: new ObjectID(userId), recipes: { $elemMatch: { id: recipeObjectId } } },
        { $set: { "recipes.$": recipe } }
    )
    if (!upsertResult.result.ok) {
        throw Error('failed to upsert recipe in the database')
    }
    if (upsertResult.result.nModified !== 1) {
        throw Error(`recipe with id: ${recipeId} does not exist`)
    }
}

module.exports.createRecipe = createRecipe
module.exports.readRecipes = readRecipes
module.exports.readRecipe = readRecipe
module.exports.updateRecipe = updateRecipe
module.exports.deleteRecipe = deleteRecipe