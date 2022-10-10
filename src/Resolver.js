export default class Resolver {
    static database = null

    static setDatabase(database) {
        this.database = database
    }

    static db() {
        if(this.database) return this.database

        throw new Error('No database has been set')
    }
}