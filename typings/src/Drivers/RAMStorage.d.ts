declare const _default: RAMStorage;
export default _default;
declare class RAMStorage extends Driver {
    store: {};
    getAllTableNames(): any;
    setFromDriver(key: any, data: any): boolean;
    getFromDriver(key: any): any;
    removeFromDriver(key: any): boolean;
    clearFromDriver(): boolean;
    getCompleteKey(key: any): string;
    getTablesKey(): string;
    getBaseKey(): string;
    updateTablesNames(): any;
    getDatabaseData(): any;
}
import Driver from "./Driver.js";
//# sourceMappingURL=RAMStorage.d.ts.map