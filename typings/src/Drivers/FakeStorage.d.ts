declare const _exports: FakeStorage;
export = _exports;
declare class FakeStorage extends Driver {
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
//# sourceMappingURL=FakeStorage.d.ts.map