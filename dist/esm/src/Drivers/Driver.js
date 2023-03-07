import Resolver from '../Resolver.js';
export default class Driver {
    setTable(table) {
        this.table = table;
        return this;
    }
    set(key, data) {
        if (Resolver.db().isCaching())
            return this.setFromCache(key, data);
        Resolver.db().executeDataChangedEventListener();
        return this.setFromDriver(key, data);
    }
    get(key) {
        if (Resolver.db().isCaching())
            return this.getFromCache(key);
        return this.getFromDriver(key);
    }
    remove(key) {
        if (Resolver.db().isCaching())
            return this.removeFromCache(key);
        Resolver.db().executeDataChangedEventListener();
        return this.removeFromDriver(key);
    }
    clear() {
        if (Resolver.db().isCaching())
            return this.clearFromCache();
        Resolver.db().executeDataChangedEventListener();
        return this.clearFromDriver();
    }
    setFromCache(key, data) {
        Resolver.db().dispatchCommand(`set ${key} on ${this.table}`, data);
        if (!Resolver.db().cache.tables[this.table]) {
            Resolver.db().cache.tables[this.table] = {};
        }
        return Resolver.db().cache.tables[this.table][key] = data;
    }
    getFromCache(key) {
        if (!Resolver.db().cache.tables[this.table])
            return null;
        return Resolver.db().cache.tables[this.table][key];
    }
    removeFromCache(key) {
        Resolver.db().dispatchCommand(`remove ${key} from ${this.table}`);
        if (!Resolver.db().cache.tables[this.table])
            return;
        delete Resolver.db().cache.tables[this.table][key];
    }
    clearFromCache() {
        Resolver.db().dispatchCommand(`clear`);
        return Resolver.db().clearCache();
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
