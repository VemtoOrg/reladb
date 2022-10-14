"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Cache_js_1 = __importDefault(require("./Cache.js"));
class Exporter {
    constructor(database) {
        this.database = database;
        this.cache = new Cache_js_1.default(this.database);
    }
    from(item) {
        this.clear();
        this.cache.from(item);
        return this;
    }
    getData() {
        let data = this.cache;
        return {
            tables: data.tables,
            exportedItems: data.cachedItems,
            exportedRelationships: data.cachedRelationships,
        };
    }
    toJson() {
        return JSON.stringify(this.getData());
    }
    clear() {
        this.cache.clear();
    }
}
exports.default = Exporter;
