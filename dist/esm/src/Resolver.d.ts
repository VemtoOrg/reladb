/** @typedef {import('./Database')} Database */
export default class Resolver {
    /** @type Database */
    static database: Database;
    static setDatabase(database: any): void;
    static db(): typeof import("./Database");
}
export type Database = typeof import("./Database");
