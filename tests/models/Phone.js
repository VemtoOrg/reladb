import User from "./User.js"
import Model from "../../src/Model.js"

export default class Phone extends Model {
    relationships() {
        return {
            owner: () => this.belongsTo(User, "ownerId"),
        }
    }
}
