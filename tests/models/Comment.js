import User from "./User.js"
import Post from "./Post.js"
import Model from "../../src/Model.js"

export default class Comment extends Model {
    relationships() {
        return {
            post: () => this.belongsTo(Post),
            author: () => this.belongsTo(User, "authorId"),
        }
    }
}
