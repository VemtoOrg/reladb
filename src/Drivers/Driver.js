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
        return window.RelaDB.cache.tables[this.table][key] = data
    }

    getFromCache(key) {
        return window.RelaDB.cache.tables[this.table][key]
    }

    removeFromCache(key) {
        delete window.RelaDB.cache.tables[this.table][key]
    }

    clearFromCache() {
        return window.RelaDB.clearCache()
    }
    
}