import User from "./User.mjs";
import Model from "../../../dist/esm/src/Model.js"

export default class Post extends Model {

    relationships() {
        return {
            owner: () => this.belongsTo(User, 'ownerId'),
        }
    }

}