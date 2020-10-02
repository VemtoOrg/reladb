import Driver from './Driver'
import Storage from './Handlers/JsonStorage'

class ElectronJsonStorage extends Driver {

    set(key, data) {
        return Storage.setRelativePath(this.table).set(key, data)
    }

    get(key) {
        return Storage.setRelativePath(this.table).get(key)
    }

    remove(key) {
        return Storage.setRelativePath(this.table).remove(key)
    }

    clear() {
        return Storage.clear()
    }

    testingMode() {
        return Storage.testingMode()
    }

}

export default new ElectronJsonStorage