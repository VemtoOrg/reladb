const Command = require("./Command")

module.exports = class Database {

    constructor() {
        this.events = {}
        this.driver = null
        this.filters = []
        this.deletingBuffer = {}
        this.commands = []
        this.executingCommandId = null

        this.cache = {tables: {}}
        this.onCacheMode = false

        this.cachedItems = []
        this.cachedRelationships = []

        this.settings = {
            addCommandToQueueOnDispatch: true
        }
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

        if(this.isCachingItem(item)) return

        this.cacheTablesInformation()

        this.cachedItems.push(item.getItemIdentifier())

        this.addItemToTableCache(item)
        this.cacheItemRelationships(item)

        this.onCacheMode = true
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

    addItemToTableCache(item) {
        let table = item.getTable()
        this.setupCacheTable(table)

        let itemPrimary = item[item.constructor.primaryKey()]

        if(this.cache.tables[table][`item_${itemPrimary}`]) return

        this.cache.tables[table][`item_${itemPrimary}`] = item
    }

    cacheTablesInformation() {
        let tables = this.driver.getAllTableNames()
        tables.forEach(table => this.addTableDataToCache(table))
    }

    addTableDataToCache(table) {
        this.setupCacheTable(table)

        if(this.cache.tables[table][table]) return

        let tableData = this.driver.setTable(table).get(table)
        
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
        this.cachedItems = []
        this.cachedRelationships = []
    }

    isCaching() {
        return this.onCacheMode
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

    dispatchCommand(cmd, data = null) {
        let command = new Command(cmd, data)
        
        if(this.settings.addCommandToQueueOnDispatch) {
            this.addCommand(command)
        }
        
        if(this.onDispatchCommand) {
            this.onDispatchCommand(command)
        }

        return command
    }

    isExecutingCommands() {
        return !! this.executingCommandId
    }

    canExecuteCommands() {
        return !this.isExecutingCommands() && this.commands.length > 0
    }

    markAsExecuting(command) {
        this.executingCommandId = command.id
    }

    markAsNotExecuting() {
        this.executingCommandId = null
    }

    addCommand(command) {
        this.commands.push(command)

        if(this.onAddCommand) {
            this.onAddCommand(command)
        }
    }

    removeCommand(command) {
        this.markAsNotExecuting()

        this.commands = this.commands.filter(
            otherCommand => otherCommand.id !== command.id
        )

        if(this.onRemoveCommand) {
            this.onRemoveCommand(command)
        }
    }

    executeNextCommand() {
        if(this.canExecuteCommands()) {
            this.commands[0].execute()
        }
    }
}