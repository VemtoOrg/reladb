const DatabaseResolver = require("../DatabaseResolver")

module.exports = class Driver {
    
    setTable(table) {
        this.table = table
        return this
    }

    set(key, data) {
        if(DatabaseResolver.resolve().isCaching()) return this.setFromCache(key, data)
        return this.setFromDriver(key, data)
    }

    get(key) {
        if(DatabaseResolver.resolve().isCaching()) return this.getFromCache(key)
        return this.getFromDriver(key)
    }

    remove(key) {
        if(DatabaseResolver.resolve().isCaching()) return this.removeFromCache(key)
        return this.removeFromDriver(key)
    }

    clear() {
        if(DatabaseResolver.resolve().isCaching()) return this.clearFromCache()
        return this.clearFromDriver()
    }

    setFromCache(key, data) {
        DatabaseResolver.resolve().dispatchCommand(`set ${key} on ${this.table}`, data)

        if(!DatabaseResolver.resolve().cache.tables[this.table]) {
            DatabaseResolver.resolve().cache.tables[this.table] = {}
        }

        return DatabaseResolver.resolve().cache.tables[this.table][key] = data
    }

    getFromCache(key) {
        if(!DatabaseResolver.resolve().cache.tables[this.table]) return null
        return DatabaseResolver.resolve().cache.tables[this.table][key]
    }

    removeFromCache(key) {
        DatabaseResolver.resolve().dispatchCommand(`remove ${key} from ${this.table}`)

        if(!DatabaseResolver.resolve().cache.tables[this.table]) return

        delete DatabaseResolver.resolve().cache.tables[this.table][key]
    }

    clearFromCache() {
        DatabaseResolver.resolve().dispatchCommand(`clear`)
        return DatabaseResolver.resolve().clearCache()
    }
    
}