import User from "./User";
import Comment from "./Comment";
import Model from "../../src/Model";

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