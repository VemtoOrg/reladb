"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Query_js_1 = __importDefault(require("../Query.js"));
class Relationship {
    constructor(model, localModel) {
        this.model = model;
        this.localModel = localModel;
        this.item = null;
        this.filters = [];
        this.type = this.relationshipType();
    }
    relationshipType() {
        return 'BasicRelationship';
    }
    getQuery() {
        return new Query_js_1.default(this.model);
    }
    setItem(item) {
        this.item = item;
        return this;
    }
    getItem() {
        return this.item;
    }
    setFilters(filters) {
        this.filters = filters;
    }
    getModelIdentifier() {
        return `${this.localModel.identifier()}:${this.__nameOnModel}`;
    }
    getItemModelIdentifier() {
        return `${this.localModel.identifier()}:${this.getItem().id}:${this.__nameOnModel}`;
    }
    setNameOnModel(name) {
        this.__nameOnModel = name;
        return this;
    }
    getNameOnModel() {
        return this.__nameOnModel;
    }
}
exports.default = Relationship;
