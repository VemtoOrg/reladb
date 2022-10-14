export = Resolver;
declare class Resolver {
    /** @type Database */
    static database: Database;
    static setDatabase(database: any): void;
    static db(): import("./Database");
}
declare namespace Resolver {
    export { Database };
}
type Database = import('./Database');
//# sourceMappingURL=Resolver.d.ts.map