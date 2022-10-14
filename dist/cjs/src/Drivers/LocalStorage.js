"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_js_1 = __importDefault(require("./Driver.js"));
class LocalStorage extends Driver_js_1.default {
    getAllTableNames() {
        let tablesKey = this.getTablesKey(), storedTablesNames = window.localStorage.getItem(tablesKey);
        return storedTablesNames ? JSON.parse(storedTablesNames) : [];
    }
    setFromDriver(key, data) {
        key = this.getCompleteKey(key);
        this.updateTablesNames();
        return window.localStorage.setItem(key, JSON.stringify(data));
    }
    getFromDriver(key) {
        key = this.getCompleteKey(key);
        let data = window.localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    removeFromDriver(key) {
        key = this.getCompleteKey(key);
        return window.localStorage.removeItem(key);
    }
    clearFromDriver() {
        return window.localStorage.clear();
    }
    getCompleteKey(key) {
        return `${this.getBaseKey()}_${this.table}_${key}`;
    }
    getTablesKey() {
        return `${this.getBaseKey()}_tables`;
    }
    getBaseKey() {
        return 'reladb_database';
    }
    updateTablesNames() {
        let tablesKey = this.getTablesKey(), tablesNames = this.getAllTableNames();
        if (!tablesNames.some(table => table === this.table)) {
            tablesNames.push(this.table);
        }
        return window.localStorage.setItem(tablesKey, JSON.stringify(tablesNames));
    }
}
exports.default = new LocalStorage;
