"use strict";
/** @typedef {import('./Database')} Database */
Object.defineProperty(exports, "__esModule", { value: true });
class Resolver {
    static setDatabase(database) {
        this.database = database;
    }
    static db() {
        if (this.database)
            return this.database;
        throw new Error('No database has been set');
    }
}
exports.default = Resolver;
/** @type Database */
Resolver.database = null;
