import Photo from "./Photo.mjs"
import Model from "../../src/Model.js"

export default class Person extends Model {
    
    static identifier() {
        return 'Person'
    }

    relationships() {
        return {
            photos: () => this.hasMany(Photo),
        }
    }

    static deleting(user) {
        user.photos.forEach(photo => photo.delete())
    }

    static deleted(id) {
        throw new Error(`Person ${id} was deleted`)
    }

}