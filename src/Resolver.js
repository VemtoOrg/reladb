/** @typedef {import('./Database')} Database */

export default class Resolver {

    /** @type Database */
    static database = null
    static databaseReadyCallback = null

    static setDatabase(database) {
        this.database = database
        
        if(this.databaseReadyCallback) {
            this.databaseReadyCallback(database)
        }

        return this
    }

    static db() {
        if(this.database) return this.database

        throw new Error('No database has been set')
    }

    static onDatabaseReady(callback) {
        this.databaseReadyCallback = callback
    }
}