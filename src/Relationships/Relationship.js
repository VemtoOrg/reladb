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

}