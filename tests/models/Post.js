import User from "./User";
import Model from "../../src/Model";

export default class Post extends Model {
    
    owner() {
        return this.belongsTo(User, 'ownerId', 'id')
    }

}