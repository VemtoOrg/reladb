import Post from "./Post";
import Model from "../../src/Model";

export default class User extends Model {
    
    relationships() {
        return {
            posts: () => this.hasMany(Post, 'ownerId', 'id')
        }
    }

}