import HasMany from "./HasMany.js"

export default class HasOne extends HasMany {
    relationshipType() {
        return "HasOne"
    }

    getAllItems() {
        return super.execute()
    }

    execute() {
        return super.execute()[0]
    }

    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`
    }
}
