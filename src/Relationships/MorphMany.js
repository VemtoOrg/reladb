import Relationship from "./Relationship.js"

export default class MorphMany extends Relationship {
    relationshipType() {
        return "MorphMany"
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

    cascadeDelete() {
        this.usesCascadeDelete = true

        return this
    }

    orderBy(field, direction = "asc") {
        this.setFilters([
            {
                field: field,
                type: "order",
                direction: direction,
            },
        ])

        return this
    }

    getAllItems() {
        return this.execute()
    }

    execute() {
        const item = this.getItem(),
            itemModelIdentifier = item.constructor.identifier()

        let morphItems = this.getQuery().setFilters(this.filters).get()

        morphItems = morphItems.filter((morphItem) => {
            return morphItem[this.morphType] === itemModelIdentifier && morphItem[this.morphKey] === item.id
        })

        return morphItems || []
    }

    signature() {
        return `${this.localModel.identifier()}->MorphMany(${this.model.identifier()}):${this.morphKey},${this.morphType}`
    }
}
