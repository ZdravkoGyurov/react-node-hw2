const { Router } = require("express")
const { sendErrorResponse } = require("../errors")
const { Recipe } = require("../models/recipe")
const { UPSERT_OPERATION, isValidId } = require("../storage/db")
const { createRecipe, readRecipes, readRecipe, updateRecipe, deleteRecipe } = require("../storage/recipeStorage")

const recipesRouter = Router({mergeParams: true})

recipesRouter.get('/', async (req, res) => {
    const userId = req.params.userId

    try {
        const collection = req.app.locals.collection
        const recipes = await readRecipes(collection, userId)
        res.status(200).json(recipes)
    } catch (err) {
        const message = 'read from db failed'
        if (err.message && err.message.includes('does not exist')) {
            return sendErrorResponse(req, res, 404, message, err)
        }
        sendErrorResponse(req, res, 500, message, err)
    }
})

recipesRouter.post('/', async (req, res) => {
    const userId = req.params.userId
    const recipeBody = req.body

    try {
        let recipe = new Recipe(recipeBody.id, userId, recipeBody.name, recipeBody.shortDescription, recipeBody.prepTimeMinutes,
            recipeBody.products, recipeBody.pictureUrl, recipeBody.longDescription, recipeBody.tags)
        recipe.validate()

        try {
            const collection = req.app.locals.collection
            recipe = await createRecipe(collection, userId, recipe)

            res.status(201).location(`/api/users/${userId}/recipes/${recipe.id}`).json(recipe)
        } catch(err) {
            const message = 'insert in db failed'
            if (err.message && err.message.includes('does not exist')) {
                return sendErrorResponse(req, res, 404, message, err)
            }
            if (err.message && err.message.includes('E11000')) {
                return sendErrorResponse(req, res, 409, `recipe already exists`, err)
            }
            sendErrorResponse(req, res, 500, message, err)
        }
    } catch (err) {
        sendErrorResponse(req, res, 400, `invalid recipe data`, err)
    }
})

recipesRouter.get('/:id', async (req, res) => {
    const userId = req.params.userId
    const recipeId = req.params.id

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid recipe data`, new Error('invalid userId'))
    }
    if(!isValidId(recipeId)) {
        return sendErrorResponse(req, res, 400, `invalid recipe data`, new Error('invalid recipeId'))
    }

    try {
        const collection = req.app.locals.collection
        const recipe = await readRecipe(collection, userId, recipeId)
        res.json(recipe)
    } catch(err) {
        const message = `read from db failed`
        if (err.message && err.message.includes('does not exist')) {
            return sendErrorResponse(req, res, 404, message, err)
        }
        if (err.message && err.message.includes('does not exist')) {
            return sendErrorResponse(req, res, 404, message, err)
        }
        sendErrorResponse(req, res, 500, message, err)
    }
})

recipesRouter.put('/:id', async (req, res) => {
    const userId = req.params.userId
    const recipeId = req.params.id
    const recipeBody = req.body

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid user data`, new Error('invalid user id'))
    }
    if(!isValidId(recipeId)) {
        return sendErrorResponse(req, res, 400, `invalid recipe data`, new Error('invalid recipeId'))
    }

    try {
        let recipe = new Recipe(recipeId, userId, recipeBody.name, recipeBody.shortDescription, recipeBody.prepTimeMinutes,
            recipeBody.products, recipeBody.pictureUrl, recipeBody.longDescription, recipeBody.tags)
        recipe.validate()

        try {
            const collection = req.app.locals.collection
            const upsertOp = await updateRecipe(collection, userId, recipeId, recipe)

            res.json(recipe)
        } catch(err) {
            sendErrorResponse(req, res, 500, `error while inserting user in the database`, err)
        }
    } catch (err) {
        sendErrorResponse(req, res, 400, `invalid user data`, err)
    }
})

recipesRouter.delete('/:id', async (req, res) => {
    const userId = req.params.userId
    const recipeId = req.params.id

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid recipe data`, new Error('invalid userId'))
    }
    if(!isValidId(recipeId)) {
        return sendErrorResponse(req, res, 400, `invalid recipe data`, new Error('invalid recipeId'))
    }

    try {
        const collection = req.app.locals.collection
        await deleteRecipe(collection, userId, recipeId)
        res.status(204).end()
    } catch(err) {
        sendErrorResponse(req, res, 500, `read from db failed`, err)
    }
})

module.exports = recipesRouter