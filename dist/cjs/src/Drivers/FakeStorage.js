"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Driver_js_1 = __importDefault(require("./Driver.js"));
class Store {
    constructor() {
        this.data = {};
    }
    getItem(key) {
        return this.data[key];
    }
    setItem(key, value) {
        this.data[key] = value;
    }
    removeItem(key) {
        delete this.data[key];
    }
    clear() {
        this.data = {};
    }
}
const fakeStorage = new Store();
class FakeStorage extends Driver_js_1.default {
    getAllTableNames() {
        let tablesKey = this.getTablesKey(), storedTablesNames = fakeStorage.getItem(tablesKey);
        return storedTablesNames ? storedTablesNames : [];
    }
    setFromDriver(key, data) {
        key = this.getCompleteKey(key);
        this.updateTablesNames();
        return fakeStorage.setItem(key, data);
    }
    getFromDriver(key) {
        key = this.getCompleteKey(key);
        let data = fakeStorage.getItem(key);
        return data ? data : null;
    }
    removeFromDriver(key) {
        key = this.getCompleteKey(key);
        return fakeStorage.removeItem(key);
    }
    clearFromDriver() {
        return fakeStorage.clear();
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
        return fakeStorage.setItem(tablesKey, tablesNames);
    }
}
exports.default = new FakeStorage;
