module.exports = class Driver {
    
    setTable(table) {
        this.table = table
        return this
    }

    set(key, data) {
        if(window.RelaDB.isCaching()) return this.setFromCache(key, data)
        return this.setFromDriver(key, data)
    }

    get(key) {
        if(window.RelaDB.isCaching()) return this.getFromCache(key)
        return this.getFromDriver(key)
    }

    remove(key) {
        if(window.RelaDB.isCaching()) return this.removeFromCache(key)
        return this.removeFromDriver(key)
    }

    clear() {
        if(window.RelaDB.isCaching()) return this.clearFromCache()
        return this.clearFromDriver()
    }

    setFromCache(key, data) {
        window.RelaDB.dispatchCommand(`set ${key} on ${this.table}`, data)

        if(!window.RelaDB.cache.tables[this.table]) {
            window.RelaDB.cache.tables[this.table] = {}
        }

        return window.RelaDB.cache.tables[this.table][key] = data
    }

    getFromCache(key) {
        if(!window.RelaDB.cache.tables[this.table]) return null
        return window.RelaDB.cache.tables[this.table][key]
    }

    removeFromCache(key) {
        window.RelaDB.dispatchCommand(`remove ${key} from ${this.table}`)

        if(!window.RelaDB.cache.tables[this.table]) return

        delete window.RelaDB.cache.tables[this.table][key]
    }

    clearFromCache() {
        window.RelaDB.dispatchCommand(`clear`)
        return window.RelaDB.clearCache()
    }
    
}