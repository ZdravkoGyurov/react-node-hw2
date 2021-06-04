const ObjectID = require('mongodb').ObjectID

class Recipe {
    constructor(id, userId, name, shortDescription, prepTimeMinutes, products, pictureUrl, longDescription, tags) {
        if (id) {
            this._id = ObjectID.createFromHexString(id)
        }
        this.userId = ObjectID.createFromHexString(userId)
        this.name = name || ""
        this.shortDescription = shortDescription || ""
        this.prepTimeMinutes = prepTimeMinutes
        this.products = products
        this.pictureUrl = pictureUrl
        this.longDescription = longDescription || ""
        this.tags = tags
        this.sharedOn = new Date()
        this.lastModifiedOn = this.sharedOn
    }

    validate() {
        if (this.name.length > 80) {
            throw Error('name should be shorter than 80 characters')
        }
        if (this.shortDescription.length > 256) {
            throw Error('name should be shorter than 256 characters')
        }
        if (this.longDescription.length > 2048) {
            throw Error('name should be shorter than 2048 characters')
        }
    }
}

function NewRecipe(recipe) {
    return new Recipe(recipe.id, recipe.userId, recipe.name, recipe.shortDescription, recipe.prepTimeMinutes, recipe.products, recipe.pictureUrl, recipe.longDescription, recipe.tags)
}
 
module.exports.Recipe = Recipe
module.exports.NewRecipe = NewRecipe