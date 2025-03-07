import Resolver from "../Resolver.js"
import Relationship from "./Relationship.js"

export default class MorphTo extends Relationship {
    relationshipType() {
        return "MorphTo"
    }

    setName(name) {
        this.name = name

        return this
    }

    setMorphKey(morphKey) {
        if (!morphKey) {
            morphKey = `${this.name}Id`
        }

        this.morphKey = morphKey

        return this
    }

    setMorphType(morphType) {
        if (!morphType) {
            morphType = `${this.name}Type`
        }

        this.morphType = morphType

        return this
    }

    getParentFromItem() {
        const item = this.getItem()

        if (!item[this.morphKey] || !item[this.morphType]) return null

        const morphType = item[this.morphType],
            model = Resolver.db().getModel(morphType)

        return model.find(item[this.morphKey])
    }

    execute() {
        return this.getParentFromItem()
    }

    signature() {
        return `${this.localModel.identifier()}->MorphTo(${this.name}):${this.morphKey},${this.morphType}`
    }
}
