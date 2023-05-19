export = Resolver;
declare class Resolver {
    /** @type Database */
    static database: Database;
    static databaseReadyCallbacks: any[];
    static setDatabase(database: any): void;
    static db(): import("./Database");
    static onDatabaseReady(callback: any): void;
}
declare namespace Resolver {
    export { Database };
}
type Database = import('./Database');
//# sourceMappingURL=Resolver.d.ts.map