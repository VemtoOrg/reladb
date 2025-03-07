import Post from "./Post.mjs"
import Address from "./Address.mjs"
import AddressUser from "./AddressUser.mjs"
import Model from "../../../dist/esm/src/Model.js"

export default class User extends Model {
    relationships() {
        return {
            posts: () => this.hasMany(Post, "ownerId", "id"),
            addresses: () => this.belongsToMany(Address, AddressUser).cascadeDetach(),
        }
    }
}
