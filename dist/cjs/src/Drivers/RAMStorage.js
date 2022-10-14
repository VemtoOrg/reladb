"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_js_1 = __importDefault(require("./Driver.js"));
class RAMStorage extends Driver_js_1.default {
    constructor() {
        super();
        this.store = this.storeBaseData();
    }
    storeBaseData() {
        return {
            tables: {},
            tablesNames: []
        };
    }
    getAllTableNames() {
        return this.store.tablesNames ? this.store.tablesNames : [];
    }
    setFromDriver(key, data) {
        key = this.getRealKey(key);
        this.updateTablesNames();
        if (!this.store.tables[this.table]) {
            this.store.tables[this.table] = {};
        }
        this.store.tables[this.table][key] = data;
        return true;
    }
    getFromDriver(key) {
        key = this.getRealKey(key);
        let tableData = this.store.tables[this.table];
        if (!tableData)
            return null;
        return tableData[key] ? tableData[key] : null;
    }
    removeFromDriver(key) {
        key = this.getRealKey(key);
        if (!this.store.tables[this.table])
            return;
        delete this.store.tables[this.table][key];
        return true;
    }
    getRealKey(key) {
        if (key === this.table)
            return '__tableData';
        return key;
    }
    clearFromDriver() {
        this.store = this.storeBaseData();
        return true;
    }
    updateTablesNames() {
        let tablesNames = this.store.tablesNames;
        if (!tablesNames.some(table => table === this.table)) {
            tablesNames.push(this.table);
        }
        return this.store.tablesNames = tablesNames;
    }
    allowsDataFeeding() {
        return true;
    }
    feedDatabaseData(data = {}) {
        this.store = JSON.parse(JSON.stringify(data));
        return true;
    }
    getDatabaseData() {
        return JSON.parse(JSON.stringify(this.store));
    }
}
exports.default = new RAMStorage;
