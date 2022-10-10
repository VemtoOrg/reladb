import User from "./User.js";
import Person from "./Person.js";
import Model from "../../src/Model.js";

export default class Photo extends Model {
    
    static identifier() {
        return 'Photo'
    }

    relationships() {
        return {
            user: () => this.belongsTo(User),
            owner: () => this.belongsTo(Person),
        }
    }

}