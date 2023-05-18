import Cache from './Cache.js'
import Command from './Command.js'
import Exporter from './Exporter.js'
import Importer from './Importer.js'

/** @typedef {import('./Drivers/Driver')} Driver */

export default class Database {
    constructor() {
        
        /** @type Driver */
        this.driver = null

        this.events = {}
        this.filters = []
        this.deletingBuffer = {}
        this.commands = []
        this.addingCommand = false
        this.executingCommandId = null

        this.tableCallbacks = {}
        this.__customEventsListeners = {}
        this.__databaseDataChangedEventListener = null

        this.cache = new Cache(this)
        this.onCacheMode = false

        this.importer = new Importer(this)
        this.exporter = new Exporter(this)

        this.settings = {
            addCommandToQueueOnDispatch: true
        }

        this.__saveDataToStorage = true

        this.__modelsRegistry = {}
    }

    addCustomEventListener(name, listener) {
        this.__customEventsListeners[name] = listener
    }

    removeCustomEventListener(name) {
        delete this.__customEventsListeners[name]
    }

    executeCustomEventListener(name, ...data) {
        if(!this.__customEventsListeners[name]) return
        
        this.__customEventsListeners[name](...data)
    }

    onDataChanged(callback) {
        this.__databaseDataChangedEventListener = callback
    }

    executeDataChangedEventListener() {
        if(!this.__databaseDataChangedEventListener) return

        this.__databaseDataChangedEventListener()
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
    
    registerModel(model, identifier, customTableName = null) {
        const modelRegister = {
            model: model,
            identifier: identifier,
        }

        model.setIdentifier(identifier)

        if(customTableName) {
            model.setCustomTableName(customTableName)
        }

        modelRegister.table = model.table()

        this.__modelsRegistry[identifier] = modelRegister
    }

    getModel(identifier) {
        return this.__modelsRegistry[identifier].model
    }

    getIdendifierByModel(model) {
        return model.identifier()
    }
}