import Post from "./Post";
import Model from "../../src/Model";

export default class User extends Model {
    
    posts() {
        return this.hasMany(Post, 'owner_id', 'id')
    }

}