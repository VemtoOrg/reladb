declare const _default: LocalStorage;
export default _default;
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
import Driver from "./Driver.js";
//# sourceMappingURL=LocalStorage.d.ts.map