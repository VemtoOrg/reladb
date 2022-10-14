declare const _exports: RAMStorage;
export = _exports;
declare class RAMStorage extends Driver {
    store: {
        tables: {};
        tablesNames: any[];
    };
    storeBaseData(): {
        tables: {};
        tablesNames: any[];
    };
    getAllTableNames(): any[];
    setFromDriver(key: any, data: any): boolean;
    getFromDriver(key: any): any;
    removeFromDriver(key: any): boolean;
    getRealKey(key: any): any;
    clearFromDriver(): boolean;
    updateTablesNames(): any[];
    getDatabaseData(): any;
}
import Driver = require("./Driver.js");
//# sourceMappingURL=RAMStorage.d.ts.map