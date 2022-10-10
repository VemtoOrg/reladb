import User from "./User.js";
import Model from "../../src/Model.js";

export default class Phone extends Model {
    
    static identifier() {
        return 'Phone'
    }

    relationships() {
        return {
            owner: () => this.belongsTo(User, 'ownerId'),
        }
    }

}