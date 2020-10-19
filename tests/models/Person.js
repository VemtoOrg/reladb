import Photo from "./Photo"
import Model from "../../src/Model"

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