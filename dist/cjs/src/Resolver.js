"use strict";
/** @typedef {import('./Database')} Database */
Object.defineProperty(exports, "__esModule", { value: true });
class Resolver {
    static setDatabase(database) {
        this.database = database;
        if (this.databaseReadyCallback) {
            this.databaseReadyCallback(database);
        }
        return this;
    }
    static db() {
        if (this.database)
            return this.database;
        throw new Error('No database has been set');
    }
    static onDatabaseReady(callback) {
        this.databaseReadyCallback = callback;
    }
}
exports.default = Resolver;
/** @type Database */
Resolver.database = null;
Resolver.databaseReadyCallback = null;
