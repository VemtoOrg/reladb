export default class Cache {

    constructor(database) {
        this.database = database

        this.tables = {}
        this.cachedItems = []
        this.cachedRelationships = []
    }

    from(item) {
        if(this.isCachingItem(item)) return

        this.cacheTablesInformation()

        this.cachedItems.push(item.getItemIdentifier())

        this.addItemToTableCache(item)
        this.cacheItemRelationships(item)

    }

    cacheTablesInformation() {
        let tables = this.database.driver.getAllTableNames()
        tables.forEach(table => this.addTableDataToCache(table))
    }

    addTableDataToCache(table) {
        this.setupCacheTable(table)

        if(this.tables[table][table]) return

        let tableData = this.database.driver.setTable(table).get(table)
        
        this.tables[table][table] = tableData
    }

    addItemToTableCache(item) {
        let table = item.getTable()
        this.setupCacheTable(table)

        let itemPrimary = item[item.constructor.primaryKey()]

        if(this.tables[table][`item_${itemPrimary}`]) return

        this.tables[table][`item_${itemPrimary}`] = item
    }

    cacheItemRelationships(item) {
        item.hasManyRelationships().forEach((relationship) => {
            if(this.isCachingRelationship(item, relationship)) return

            this.cachedRelationships.push(relationship.getItemModelIdentifier(item))
            
            this.setupCacheTable(relationship.model.table())

            let relationshipItems = relationship.execute(item)
            
            if(!relationshipItems) return

            relationshipItems = Array.isArray(relationshipItems) ? relationshipItems : [relationshipItems]

            relationshipItems.forEach(relatedItem => {
                this.addItemToTableCache(relatedItem)
                this.cacheItemRelationships(relatedItem)
            })
        })
    }

    setupCacheTable(table) {
        if(!this.tables[table]) {
            this.tables[table] = {}
        }
    }

    clear() {
        this.tables = {}
        this.cachedItems = []
        this.cachedRelationships = []
    }

    isCachingItem(item) {
        return this.cachedItems.some(
            cached => cached === item.getItemIdentifier()
        )
    }

    isCachingRelationship(item, relationship) {
        return this.cachedRelationships.some(
            cached => cached === relationship.getItemModelIdentifier(item)
        )
    }

}