import User from "./User";
import Model from "../../src/Model";

export default class Post extends Model {
    
    relationships() {
        return {
            owner: () => this.belongsTo(User, 'ownerId')
        }
    }

}