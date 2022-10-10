import Cache from './Cache.js';

export default class Exporter {

    constructor(database) {
        this.database = database

        this.cache = new Cache(this.database)
    }

    from(item) {
        this.clear()
        
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