import Post from "./Post"
import Phone from "./Phone"
import Model from "../../src/Model"

export default class User extends Model {
    
    relationships() {
        return {
            posts: () => this.hasMany(Post, 'ownerId', 'id'),
            phones: () => this.hasMany(Phone, 'ownerId', 'id').cascadeDelete()
        }
    }

    static creating(data) {
        data.email = 'my@email.com'
        return data
    }

    static created(user) {
        Phone.create({phone: '99999-9999', ownerId: user.id})
    }

    testMethod() {
        return 'test'
    }

}