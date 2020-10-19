import User from "./User";
import Model from "../../src/Model";

export default class Document extends Model {
    
    static identifier() {
        return 'Document'
    }

    relationships() {
        return {
            user: () => this.belongsTo(User).atMostOne(),
            parent: () => this.belongsTo(Document, 'parentId').atMostOne(),
            child: () => this.hasOne(Document, 'parentId').cascadeDelete(),
        }
    }

}