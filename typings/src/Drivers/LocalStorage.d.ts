declare const _exports: LocalStorage;
export = _exports;
declare class LocalStorage extends Driver {
    getAllTableNames(): any;
    setFromDriver(key: any, data: any): void;
    getFromDriver(key: any): any;
    removeFromDriver(key: any): void;
    clearFromDriver(): void;
    getCompleteKey(key: any): string;
    getTablesKey(): string;
    getBaseKey(): string;
    updateTablesNames(): void;
}
import Driver = require("./Driver.js");
//# sourceMappingURL=LocalStorage.d.ts.map