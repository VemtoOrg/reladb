const Cache = require("./Cache")

module.exports = class Exporter {

    constructor(database) {
        this.database = database

        this.cache = new Cache(this.database)
    }

    from(item) {
        this.cache.from(item)

        return this
    }

    getData() {
        let data = this.cache

        return {
            tables: data.tables,
            exportedItems: data.cachedItems,
            exportedRelationships: data.cachedRelationships,
        }
    }

    toJson() {
        return JSON.stringify(
            this.getData()
        )
    }

    clear() {
        this.cache.clear()
    }

}