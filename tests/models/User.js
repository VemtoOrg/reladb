import Post from "./Post";
import Model from "../../src/Model";

export default class User extends Model {
    
    relationships() {
        return {
            posts() {
                return this.hasMany(Post, 'ownerId', 'id')
            }
        }
    }

}

/**

user > posts

user: {
    hasMany:
        posts: [1,5,3,6]
}

post: {
    belongsTo:
        owner: 1
}

 */