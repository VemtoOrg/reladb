import Model from "../../src/Model.js"

export default class Tag extends Model {
    relationships() {
        return {
            taggable: () => this.morphTo("taggable"),
        }
    }
}
