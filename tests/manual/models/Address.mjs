import User from "./User.mjs";
import AddressUser from "./AddressUser.mjs";
import Model from "../../../dist/esm/src/Model.js"

export default class Address extends Model {

    relationships() {
        return {
            users: () => this.belongsToMany(User, AddressUser),
        }
    }

}