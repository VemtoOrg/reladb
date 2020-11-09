module.exports = class Database {

    constructor() {
        this.events = {}
        this.driver = null
        this.filters = []
        this.deletingBuffer = {}
        this.dispatches = []

        this.cache = {tables: {}}
        this.onCacheMode = false
    }

    setDriver(driver) {
        this.driver = driver
    }

    isAlreadyDeleting(table, id) {
        if(!this.deletingBuffer[table]) return false
        return !! this.deletingBuffer[table][id]
    }

    addToDeletingBuffer(table, id) {
        if(!this.deletingBuffer[table]) {
            this.deletingBuffer[table] = {}
        }

        this.deletingBuffer[table][id] = true
        
        if(this.deletingBufferListener) this.deletingBufferListener(this.cloneProperty('deletingBuffer'))
    }

    removeFromDeletingBuffer(table, id) {
        if(!this.deletingBuffer[table]) return
        delete this.deletingBuffer[table][id]
        
        if(this.deletingBufferListener) this.deletingBufferListener(this.cloneProperty('deletingBuffer'))
    }

    registerDeletingBufferListener(listenerFunction) {
        this.deletingBufferListener = listenerFunction
    }

    cloneProperty(property) {
        return JSON.parse(JSON.stringify(this[property]))
    }

    cacheFrom(item) {
        this.addItemToTableCache(item)
        this.cacheItemRelationships(item)

        this.onCacheMode = true
    }

    cacheItemRelationships(item) {
        item.hasManyRelationships().forEach((relationship) => {
            let relationshipItems = relationship.execute(item)
            
            if(!relationshipItems) return

            relationshipItems = Array.isArray(relationshipItems) ? relationshipItems : [relationshipItems]

            relationshipItems.forEach(relatedItem => {
                this.addItemToTableCache(relatedItem)
                this.cacheItemRelationships(relatedItem)
            })
        })
    }

    addItemToTableCache(item) {
        let table = item.constructor.table()

        if(!this.cache.tables[table]) {
            this.cache.tables[table] = {}
        }

        let itemPrimary = item[item.constructor.primaryKey()]

        if(this.cache.tables[table][`item_${itemPrimary}`]) return

        this.cache.tables[table][`item_${itemPrimary}`] = item
    }

    stopCaching() {
        this.onCacheMode = false
        this.cache = {tables: {}}
    }

    isCaching() {
        return this.onCacheMode
    }

    runCommand(command, data) {

    }
}