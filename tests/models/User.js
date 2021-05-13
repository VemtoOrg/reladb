import Post from "./Post"
import Phone from "./Phone"
import Photo from "./Photo"
import Document from "./Document"
import Model from "../../src/Model"

export default class User extends Model {
    
    static identifier() {
        return 'User'
    }

    relationships() {
        return {
            photos: () => this.hasMany(Photo),
            posts: () => this.hasMany(Post, 'ownerId', 'id'),
            document: () => this.hasOne(Document).cascadeDelete(),
            phones: () => this.hasMany(Phone, 'ownerId', 'id').cascadeDelete(),
        }
    }

    static creating(data) {
        data.email = 'my@email.com'
        return data
    }

    static created(user) {
        Phone.create({phone: '99999-9999', ownerId: user.id})
    }

    static updating(data, oldData) {
        if(data.name != oldData.name) {
            data.name = data.name + ' Edited'
        }

        data.email = 'my_edited@email.com'
        
        return data
    }

    static updated(user) {
        Phone.create({phone: '77777-7777', ownerId: user.id})
    }

    testMethod() {
        return 'test'
    }

}