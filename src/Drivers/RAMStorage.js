const Driver = require('./Driver.js')

class RAMStorage extends Driver {

    constructor() {
        super()

        this.store = this.storeBaseData()
    }

    storeBaseData() {
        return {
            tables: {},
            tablesNames: []
        }
    }

    getAllTableNames() {
        return this.store.tablesNames ? this.store.tablesNames : []
    }

    setFromDriver(key, data) {
        key = this.getRealKey(key)
        
        this.updateTablesNames()

        if(!this.store.tables[this.table]) {
            this.store.tables[this.table] = {}
        }

        this.store.tables[this.table][key] = data

        return true
    }

    getFromDriver(key) {
        key = this.getRealKey(key)

        let tableData = this.store.tables[this.table]

        if(!tableData) return null

        return tableData[key] ? tableData[key] : null
    }

    removeFromDriver(key) {
        key = this.getRealKey(key)

        if(!this.store.tables[this.table]) return

        delete this.store.tables[this.table][key]

        return true
    }

    getRealKey(key) {
        if(key === this.table) return '__tableData'

        return key
    }

    clearFromDriver() {
        this.store = this.storeBaseData()

        return true
    }

    updateTablesNames() {
        let tablesNames = this.store.tablesNames

        if(!tablesNames.some(table => table === this.table)) {
            tablesNames.push(this.table)
        }

        return this.store.tablesNames = tablesNames
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