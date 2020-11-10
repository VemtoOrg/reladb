const Query = require("../Query")

module.exports = class Relationship {

    constructor(model, localModel) {
        this.model = model
        this.localModel = localModel
        this.filters = []
    }

    getQuery() {
        return new Query(this.model)
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

}