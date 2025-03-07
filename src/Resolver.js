/** @typedef {import('./Database')} Database */

export default class Resolver {
    /** @type Database */
    static database = null
    static databaseReadyCallbacks = []

    static setDatabase(database) {
        this.database = database

        if (this.databaseReadyCallbacks.length) {
            this.databaseReadyCallbacks.forEach((callback) => callback())
        }

        return this
    }

    static db() {
        if (this.database) return this.database

        throw new Error("No database has been set")
    }

    static onDatabaseReady(callback) {
        this.databaseReadyCallbacks.push(callback)
    }
}
