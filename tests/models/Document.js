import User from "./User";
import Model from "../../src/Model";

export default class Document extends Model {
    
    relationships() {
        return {
            user: () => this.belongsTo(User).atMostOne(),
        }
    }

}