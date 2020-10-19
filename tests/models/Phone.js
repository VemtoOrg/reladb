import User from "./User";
import Model from "../../src/Model";

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