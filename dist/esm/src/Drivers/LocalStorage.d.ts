declare const _default: LocalStorage;
export default _default;
declare class LocalStorage extends Driver {
    getAllTableNames(): any;
    setFromDriver(key: any, data: any): any;
    getFromDriver(key: any): any;
    removeFromDriver(key: any): any;
    clearFromDriver(): any;
    getCompleteKey(key: any): string;
    getTablesKey(): string;
    getBaseKey(): string;
    updateTablesNames(): any;
}
import Driver from "./Driver.js";
