import Person from "./Person.mjs"
import Model from "../../src/Model.js"

export default class Photo extends Model {
    
    static identifier() {
        return 'Photo'
    }

    relationships() {
        return {
            owner: () => this.belongsTo(Person),
        }
    }

}