const Driver = require("./Driver")

class LocalStorage extends Driver {

    set(key, data) {
        key = this.getCompleteKey(key)

        return window.localStorage.setItem(key, JSON.stringify(data))
    }

    get(key) {
        key = this.getCompleteKey(key)

        let data = window.localStorage.getItem(key)

        return data ? JSON.parse(data) : null
    }

    remove(key) {
        key = this.getCompleteKey(key)

        return window.localStorage.removeItem(key)
    }

    clear() {
        return window.localStorage.clear()
    }

    getCompleteKey(key) {
        return `reladb_database_${this.table}_${key}`
    }

}

module.exports = new LocalStorage