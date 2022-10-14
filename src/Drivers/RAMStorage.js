const Driver = require('./Driver.js')

class RAMStorage extends Driver {

    constructor() {
        super()
        this.store = {}
    }

    getAllTableNames() {
        let tablesKey = this.getTablesKey(),
            storedTablesNames = this.store[tablesKey]

        return storedTablesNames ? storedTablesNames : []
    }

    setFromDriver(key, data) {
        key = this.getCompleteKey(key)

        this.updateTablesNames()

        this.store[key] = data

        return true
    }

    getFromDriver(key) {
        key = this.getCompleteKey(key)

        let data = this.store[key]

        return data ? data : null
    }

    removeFromDriver(key) {
        key = this.getCompleteKey(key)

        delete this.store[key]

        return true
    }

    clearFromDriver() {
        this.store = {}

        return true
    }

    getCompleteKey(key) {
        return `${this.getBaseKey()}_${this.table}_${key}`
    }

    getTablesKey() {
        return `${this.getBaseKey()}_tables`
    }

    getBaseKey() {
        return 'reladb_database'
    }

    updateTablesNames() {
        let tablesKey = this.getTablesKey(),
            tablesNames = this.getAllTableNames()

        if(!tablesNames.some(table => table === this.table)) {
            tablesNames.push(this.table)
        }

        return this.store[tablesKey] = tablesNames
    }

    allowsDataFeeding() {
        return true
    }

    feedDatabaseData(data = {}) {
        this.store = JSON.parse(JSON.stringify(data))
        return true
    }

    getDatabaseData() {
        return JSON.parse(JSON.stringify(this.store))
    }

}

module.exports = new RAMStorage