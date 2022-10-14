declare const _default: RAMStorage;
export default _default;
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
import Driver from "./Driver.js";
