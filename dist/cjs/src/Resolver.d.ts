/** @typedef {import('./Database')} Database */
export default class Resolver {
    /** @type Database */
    static database: Database;
    static databaseReadyCallback: any;
    static setDatabase(database: any): typeof Resolver;
    static db(): typeof import("./Database");
    static onDatabaseReady(callback: any): void;
}
export type Database = typeof import("./Database");
