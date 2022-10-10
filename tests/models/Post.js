import User from "./User.js";
import Comment from "./Comment.js";
import Model from "../../src/Model.js";

export default class Post extends Model {
    
    static identifier() {
        return 'Post'
    }

    relationships() {
        return {
            owner: () => this.belongsTo(User, 'ownerId'),
            comments: () => this.hasMany(Comment).orderBy('order').cascadeDelete()
        }
    }

}