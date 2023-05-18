import Query from "../Query.js"

export default class Relationship {

    constructor(model, localModel) {
        this.model = model
        this.localModel = localModel
        
        this.item = null

        this.filters = []

        this.type = this.relationshipType()
    }

    relationshipType() {
        return 'BasicRelationship'
    }

    getQuery() {
        return new Query(this.model)
    }

    setItem(item) {
        this.item = item

        return this
    }

    getItem() {
        return this.item
    }

    setFilters(filters) {
        this.filters = filters
    }

    getModelIdentifier() {
        return `${this.localModel.identifier()}:${this.__nameOnModel}`
    }

    getItemModelIdentifier(item) {
        return `${this.localModel.identifier()}:${item.id}:${this.__nameOnModel}`
    }

    setNameOnModel(name) {
        this.__nameOnModel = name

        return this
    }

    getNameOnModel() {
        return this.__nameOnModel
    }

}