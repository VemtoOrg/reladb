module.exports = class DatabaseResolver {
    static database = null

    static setDatabase(database) {
        this.database = database
    }

    static resolve() {
        if(this.database) return this.database

        throw new Error('No database has been set')
    }
}