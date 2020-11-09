module.exports = class Dispatch {

    constructor(command, data = null) {
        this.command = command
        this.data = data
    }

    execute() {
        window.RelaDB.executeCommand(this.command, this.data)
    }

}