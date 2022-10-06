const { v4: uuidv4 } = require('uuid')
const DatabaseResolver = require('./DatabaseResolver')

module.exports = class Command {

    constructor(command, data = null, id = null) {
        this.id = id || uuidv4()
        this.command = command
        this.data = data
    }

    updateDataFromCommand(command) {
        this.data = command.data

        return this
    }

    execute() {
        try {
            DatabaseResolver.resolve().markAsExecuting(this)
            this.executeParsedCommand()
            DatabaseResolver.resolve().removeCommand(this)
        } catch (error) {

            if(DatabaseResolver.resolve().mode === 'development') {
                throw error
            }

            DatabaseResolver.resolve().removeCommand(this)

        }
    }

    executeParsedCommand() {
        if(this.command === 'clear') return DatabaseResolver.resolve().driver.clear()

        let parsed = this.parseCommand()

        if(parsed.type === 'set') {
            DatabaseResolver.resolve().driver.setTable(parsed.table).set(parsed.key, this.data)
        }

        if(parsed.type === 'remove') {
            DatabaseResolver.resolve().driver.setTable(parsed.table).remove(parsed.key)
        }
    }

    parseCommand() {

        let validCommands = ['set', 'remove'],
            validPrepositions = ['on', 'from']

        let sections = this.command.split(' ')

        if(!validCommands.includes(sections[0])) throw new Error('Please specify a valid command')
        if(!validPrepositions.includes(sections[2])) throw new Error('Please specify a valid command')

        return {
            type: sections[0],
            key: sections[1],
            table: sections[3],
        }
    }

}