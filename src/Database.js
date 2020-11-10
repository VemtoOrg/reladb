const Command = require("./Command")

module.exports = class Database {

    constructor() {
        this.events = {}
        this.driver = null
        this.filters = []
        this.deletingBuffer = {}
        this.commands = []

        this.cache = {tables: {}}
        this.onCacheMode = false

        this.cachedRelationships = []
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
            if(this.cachedRelationships.some(cached => cached === relationship.getItemModelIdentifier(item))) return

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

    addItemToTableCache(item) {
        let table = item.getTable()
        this.setupCacheTable(table)

        this.addItemTableDataToCache(item)

        let itemPrimary = item[item.constructor.primaryKey()]

        if(this.cache.tables[table][`item_${itemPrimary}`]) return

        this.cache.tables[table][`item_${itemPrimary}`] = item
    }

    addItemTableDataToCache(item) {
        let table = item.getTable()
        this.setupCacheTable(table)

        if(this.cache.tables[table][table]) return

        let tableData = item.getTableData()
        
        this.cache.tables[table][table] = tableData
    }

    setupCacheTable(table) {
        if(!this.cache.tables[table]) {
            this.cache.tables[table] = {}
        }
    }

    stopCaching() {
        this.onCacheMode = false
        this.clearCache()
    }

    clearCache() {
        this.cache = {tables: {}}
        this.cachedRelationships = []
    }

    isCaching() {
        return this.onCacheMode
    }

    dispatchCommand(cmd, data = null) {
        let command = new Command(cmd, data)
        
        this.commands.push(command)
        
        if(this.onDispatchCommand) {
            this.onDispatchCommand(command)
        }

        return command
    }

    removeCommand(command) {
        this.commands = this.commands.filter(
            otherCommand => otherCommand.id !== command.id
        )
    }
}