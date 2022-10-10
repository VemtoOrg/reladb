import Driver from './Driver.js'

class FakeStorage extends Driver {

    constructor() {
        super()

        this.storage = {
            data: {},
            getItem: (key) => {
                return this.storage.data[key]
            },
            setItem: (key, value) => {
                this.storage.data[key] = value
            },
            removeItem: (key) => {
                delete this.storage.data[key]
            },
            clear: () => {
                this.storage.data = {}
            }
        }
    }

    getAllTableNames() {
        let tablesKey = this.getTablesKey(),
            storedTablesNames = this.storage.getItem(tablesKey)

        return storedTablesNames ? JSON.parse(storedTablesNames) : []
    }

    setFromDriver(key, data) {
        key = this.getCompleteKey(key)

        this.updateTablesNames()

        return this.storage.setItem(key, JSON.stringify(data))
    }

    getFromDriver(key) {
        key = this.getCompleteKey(key)

        let data = this.storage.getItem(key)

        return data ? JSON.parse(data) : null
    }

    removeFromDriver(key) {
        key = this.getCompleteKey(key)

        return this.storage.removeItem(key)
    }

    clearFromDriver() {
        return this.storage.clear()
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

        return this.storage.setItem(tablesKey, JSON.stringify(tablesNames))
    }

}

export default new FakeStorage