import User from "./User";
import Post from "./Post";
import Model from "../../src/Model";

export default class Comment extends Model {
    
    relationships() {
        return {
            post: () => this.belongsTo(Post),
            author: () => this.belongsTo(User, 'authorId'),
        }
    }

}