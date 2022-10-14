"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_js_1 = __importDefault(require("../Resolver.js"));
class Driver {
    setTable(table) {
        this.table = table;
        return this;
    }
    set(key, data) {
        if (Resolver_js_1.default.db().isCaching())
            return this.setFromCache(key, data);
        Resolver_js_1.default.db().executeDataChangedEventListener();
        return this.setFromDriver(key, data);
    }
    get(key) {
        if (Resolver_js_1.default.db().isCaching())
            return this.getFromCache(key);
        Resolver_js_1.default.db().executeDataChangedEventListener();
        return this.getFromDriver(key);
    }
    remove(key) {
        if (Resolver_js_1.default.db().isCaching())
            return this.removeFromCache(key);
        Resolver_js_1.default.db().executeDataChangedEventListener();
        return this.removeFromDriver(key);
    }
    clear() {
        if (Resolver_js_1.default.db().isCaching())
            return this.clearFromCache();
        Resolver_js_1.default.db().executeDataChangedEventListener();
        return this.clearFromDriver();
    }
    setFromCache(key, data) {
        Resolver_js_1.default.db().dispatchCommand(`set ${key} on ${this.table}`, data);
        if (!Resolver_js_1.default.db().cache.tables[this.table]) {
            Resolver_js_1.default.db().cache.tables[this.table] = {};
        }
        return Resolver_js_1.default.db().cache.tables[this.table][key] = data;
    }
    getFromCache(key) {
        if (!Resolver_js_1.default.db().cache.tables[this.table])
            return null;
        return Resolver_js_1.default.db().cache.tables[this.table][key];
    }
    removeFromCache(key) {
        Resolver_js_1.default.db().dispatchCommand(`remove ${key} from ${this.table}`);
        if (!Resolver_js_1.default.db().cache.tables[this.table])
            return;
        delete Resolver_js_1.default.db().cache.tables[this.table][key];
    }
    clearFromCache() {
        Resolver_js_1.default.db().dispatchCommand(`clear`);
        return Resolver_js_1.default.db().clearCache();
    }
    allowsDataFeeding() {
        return false;
    }
    feedDatabaseData(data = {}) {
        return true;
    }
    getDatabaseData() {
        return {};
    }
}
exports.default = Driver;
