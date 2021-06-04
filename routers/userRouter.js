const { Router } = require("express")
const { sendErrorResponse } = require("../errors")
const { User } = require("../models/user")
const { UPSERT_OPERATION, isValidId } = require("../storage/db")
const { createUser, readUsers, readUser, upsertUser, deleteUser } = require("../storage/userStorage")
const recipesRouter = require("./recipeRouter")

const userRouter = Router()

userRouter.use('/:userId/recipes', recipesRouter)

userRouter.get('/', async (req, res) => {
    try {
        const collection = req.app.locals.collection
        const users = await readUsers(collection)
        res.status(200).json(users)
    } catch (err) {
        sendErrorResponse(req, res, 500, `Server error: ${err.message}`, err)
    }
})

userRouter.post('/', async (req, res) => {
    const userBody = req.body
    
    try {
        let user = new User(userBody.id, userBody.name, userBody.username, userBody.password, userBody.gender, userBody.role, userBody.avatarUrl, userBody.description, userBody.status, userBody.recipes)
        user.validate()

        try {
            const collection = req.app.locals.collection
            user = await createUser(collection, user)

            res.status(201).location(`/api/users/${user.id}`).json(user)
        } catch(err) {
            if (err.message && err.message.includes('E11000')) {
                return sendErrorResponse(req, res, 409, `user already exists`, err)
            }
            sendErrorResponse(req, res, 500, `error while inserting user in the database`, err)
        }
    } catch (err) {
        sendErrorResponse(req, res, 400, `invalid user data`, err)
    }
})

userRouter.get('/:userId', async (req, res) => {
    const userId = req.params.userId

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid user data`, new Error('invalid user id'))
    }

    try {
        const collection = req.app.locals.collection
        const user = await readUser(collection, userId)
        res.json(user)
    } catch(err) {
        const message = `read from db failed`
        if (err.message && err.message.includes('does not exist')) {
            return sendErrorResponse(req, res, 404, message, err)
        }
        sendErrorResponse(req, res, 500, message, err)
    }
})

userRouter.put('/:userId', async (req, res) => {
    const userId = req.params.userId
    const userBody = req.body

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid user data`, new Error('invalid user id'))
    }

    try {
        let user = new User(userId, userBody.name, userBody.username, userBody.password, userBody.gender, userBody.role, userBody.avatarUrl, userBody.description, userBody.status, userBody.recipes)
        user.validate()

        try {
            const collection = req.app.locals.collection
            const upsertOp = await upsertUser(collection, userId, user)

            if (upsertOp === UPSERT_OPERATION.INSERT) {
                return res.status(201).location(`/api/users/${userId}`).json(user)
            }
            console.log(user);
            res.json(user)
        } catch(err) {
            sendErrorResponse(req, res, 500, `error while inserting user in the database`, err)
        }
    } catch (err) {
        sendErrorResponse(req, res, 400, `invalid user data`, err)
    }
})

userRouter.delete('/:userId', async (req, res) => {
    const userId = req.params.userId

    if(!isValidId(userId)) {
        return sendErrorResponse(req, res, 400, `invalid user data`, new Error('invalid user id'))
    }
    
    try {
        const collection = req.app.locals.collection
        await deleteUser(collection, userId)
        res.status(204).end()
    } catch(err) {
        sendErrorResponse(req, res, 500, `read from db failed`, err)
    }
})

module.exports = userRouter