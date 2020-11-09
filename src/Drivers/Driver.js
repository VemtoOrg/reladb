module.exports = class Driver {
    
    setTable(table) {
        this.table = table
        return this
    }

    set(key, data) {
        return this.setFromDriver(key, data)
    }

    get(key) {
        return this.getFromDriver(key)
    }

    remove(key) {
        return this.removeFromDriver(key)
    }

    clear() {
        return this.clearFromDriver()
    }
    
}