const Cache = require("./Cache")
const Command = require("./Command")
const Exporter = require("./Exporter")
const Importer = require("./Importer")

module.exports = class Database {

    constructor() {
        this.events = {}
        this.driver = null
        this.filters = []
        this.deletingBuffer = {}
        this.commands = []
        this.addingCommand = false
        this.executingCommandId = null

        this.tableCallbacks = {}

        this.cache = new Cache(this)
        this.onCacheMode = false

        this.importer = new Importer(this)
        this.exporter = new Exporter(this)

        this.settings = {
            addCommandToQueueOnDispatch: true
        }

        this.__saveDataToStorage = true
    }

    disableSavingData() {
        this.__saveDataToStorage = false
    }

    enableSavingData() {
        this.__saveDataToStorage = true
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
        this.cache.from(item)

        this.onCacheMode = true
    }

    stopCaching() {
        this.onCacheMode = false
        this.cache.clear()
    }

    isCaching() {
        return this.onCacheMode
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
        return !this.isExecutingCommands() && this.commands.length > 0 && !this.isAddingCommands()
    }

    isAddingCommands() {
        return this.addingCommand
    }

    markAsExecuting(command) {
        this.executingCommandId = command.id
    }

    markAsNotExecuting() {
        this.executingCommandId = null
    }

    addCommand(command) {
        this.addingCommand = true

        let similarCommands = this.getSimilarCommands(command)

        if(similarCommands.length) {
            let latestSimilarCommand = similarCommands[similarCommands.length - 1]
            latestSimilarCommand.updateDataFromCommand(command)

            similarCommands.forEach(command => {
                if(command.id !== latestSimilarCommand.id) {
                    this.removeCommand(command)
                }
            })
        } else {
            this.commands.push(command)
        }

        if(this.onAddCommand) {
            this.onAddCommand(command)
        }

        this.addingCommand = false
    }

    getSimilarCommands(baseCommand) {
        return this.commands.filter(command => {
            return command.command === baseCommand.command
                && this.executingCommandId !== command.id
        })
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

    onUpdateTable(table, callback) {
        this.tableCallbacks[table] = callback
    }

    executeOnUpdateCallbackForTable(table, data) {
        if(this.tableCallbacks[table]) {
            this.tableCallbacks[table](data)
        }
    }
    
}