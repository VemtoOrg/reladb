const Driver = require('./Driver')
const Storage = require('./Handlers/JsonStorage')

class ElectronJsonStorage extends Driver {

    setFromDriver(key, data) {
        return Storage.setRelativePath(this.table).set(key, data)
    }

    getFromDriver(key) {
        return Storage.setRelativePath(this.table).get(key)
    }

    removeFromDriver(key) {
        return Storage.setRelativePath(this.table).remove(key)
    }

    clearFromDriver() {
        return Storage.clear()
    }

    testingMode() {
        return Storage.testingMode()
    }

}

module.exports = new ElectronJsonStorage