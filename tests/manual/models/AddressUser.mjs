import User from "./User.mjs"
import Address from "./Address.mjs"
import Model from "../../../dist/esm/src/Model.js"

export default class AddressUser extends Model {
    relationships() {
        return {
            user: () => this.belongsTo(User),
            address: () => this.belongsTo(Address),
        }
    }
}
