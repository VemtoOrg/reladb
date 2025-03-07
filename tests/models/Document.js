import Tag from "./Tag.js"
import User from "./User.js"
import Model from "../../src/Model.js"

export default class Document extends Model {
    relationships() {
        return {
            tags: () => this.morphMany(Tag, "taggable"),
            user: () => this.belongsTo(User).atMostOne(),
            parent: () => this.belongsTo(Document, "parentId").atMostOne(),
            child: () => this.hasOne(Document, "parentId").cascadeDelete(),
        }
    }
}
