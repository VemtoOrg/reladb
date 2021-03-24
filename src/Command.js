const { v4: uuidv4 } = require('uuid')

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
            window.RelaDB.markAsExecuting(this)
            this.executeParsedCommand()
            window.RelaDB.removeCommand(this)
        } catch (error) {

            if(window.RelaDB.mode === 'development') {
                throw error
            }

            window.RelaDB.removeCommand(this)

        }
    }

    executeParsedCommand() {
        if(this.command === 'clear') return window.RelaDB.driver.clear()

        let parsed = this.parseCommand()

        if(parsed.type === 'set') {
            window.RelaDB.driver.setTable(parsed.table).set(parsed.key, this.data)
        }

        if(parsed.type === 'remove') {
            window.RelaDB.driver.setTable(parsed.table).remove(parsed.key)
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