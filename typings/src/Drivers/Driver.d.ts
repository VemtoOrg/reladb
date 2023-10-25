export = Driver;
declare class Driver {
    setTable(table: any): import("./Driver.js");
    table: any;
    set(key: any, data: any): any;
    get(key: any): any;
    remove(key: any): any;
    clear(): any;
    setFromCache(key: any, data: any): any;
    getFromCache(key: any): any;
    removeFromCache(key: any): void;
    clearFromCache(): any;
    allowsDataFeeding(): boolean;
    feedDatabaseData(data?: {}): boolean;
    getDatabaseData(): {};
    storeBaseData(): any;
}
//# sourceMappingURL=Driver.d.ts.map