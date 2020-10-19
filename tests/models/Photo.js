import User from "./User";
import Person from "./Person";
import Model from "../../src/Model";

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