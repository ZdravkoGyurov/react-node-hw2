const ObjectID = require('mongodb').ObjectID


const GENDER = {
    MALE: "male",
    FEMALE: "female"
}

const ROLE = {
    ADMIN: "admin",
    USER: "user"
}

const STATUS = {
    ACTIVE: "active",
    SUSPENDED: "suspended",
    DEACTIVATED: "deactivated"
}

class User {
    constructor(id, name, username, password, gender, role, avatarUrl, description, status, recipes) {
        if (id) {
            this._id = ObjectID.createFromHexString(id)
        }
        this.name = name
        this.username = username || ""
        this.password = password
        this.gender = gender
        this.role = role || ROLE.USER
        this.avatarUrl = avatarUrl || ""
        this.description = description || ""
        this.status = status
        this.createdOn = new Date()
        this.lastModifiedOn = this.createdOn
        this.recipes = recipes || []
    }

    validate() {
        if (this.username.length > 15) {
            throw Error('username should be shorter than 15 characters')
        }
        if (!this.password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)) {
            throw Error('password should be of minimum 8 characters, one lowercase, one number and one special case character')
        }
        if (this.gender !== GENDER.MALE && this.gender !== GENDER.FEMALE) {
            throw Error('gender can only be one of [male, female]')
        }
        if (this.role !== ROLE.USER && this.role !== ROLE.ADMIN) {
            throw Error('role can only be one of [user, admin]')
        }
        if (this.description.length > 512) {
            throw Error('description should be shorter than 512 characters')
        }
        if (this.status !== STATUS.ACTIVE && this.status !== STATUS.SUSPENDED && this.status !== STATUS.DEACTIVATED) { 
            throw Error('status can only be one of [active, suspended, deactivated]')
        }
        if (this.recipes) {
            this.recipes.forEach(r => NewRecipe(r).validate())
        }
    }
}

module.exports.User = User