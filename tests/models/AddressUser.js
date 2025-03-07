import User from "./User.js"
import Address from "./Address.js"
import Model from "../../src/Model.js"

export default class AddressUser extends Model {
    relationships() {
        return {
            user: () => this.belongsTo(User),
            address: () => this.belongsTo(Address),
        }
    }
}
