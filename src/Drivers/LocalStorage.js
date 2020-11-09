const Driver = require("./Driver")

class LocalStorage extends Driver {

    setFromDriver(key, data) {
        key = this.getCompleteKey(key)

        return window.localStorage.setItem(key, JSON.stringify(data))
    }

    getFromDriver(key) {
        key = this.getCompleteKey(key)

        let data = window.localStorage.getItem(key)

        return data ? JSON.parse(data) : null
    }

    removeFromDriver(key) {
        key = this.getCompleteKey(key)

        return window.localStorage.removeItem(key)
    }

    clearFromDriver() {
        return window.localStorage.clear()
    }

    getCompleteKey(key) {
        return `reladb_database_${this.table}_${key}`
    }

}

module.exports = new LocalStorage