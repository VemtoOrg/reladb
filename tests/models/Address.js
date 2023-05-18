import User from "./User.js";
import Model from "../../src/Model.js";
import AddressUser from "./AddressUser.js";

export default class Address extends Model {

    relationships() {
        return {
            users: () => this.belongsToMany(User, AddressUser),
        }
    }

}