export default class Driver {
    setTable(table: any): Driver;
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
}
//# sourceMappingURL=Driver.d.ts.map