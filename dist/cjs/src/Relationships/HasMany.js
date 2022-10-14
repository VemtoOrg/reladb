"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relationship_js_1 = __importDefault(require("./Relationship.js"));
class HasMany extends Relationship_js_1.default {
    relationshipType() {
        return 'HasMany';
    }
    setForeignKey(foreignKey) {
        if (!foreignKey) {
            foreignKey = `${this.localModel.identifier().toLowerCase()}Id`;
        }
        this.foreignKey = foreignKey;
        return this;
    }
    setLocalKey(localKey) {
        if (!localKey) {
            localKey = this.model.primaryKey();
        }
        this.localKey = localKey;
        return this;
    }
    cascadeDelete() {
        this.usesCascadeDelete = true;
        return this;
    }
    orderBy(field, direction = 'asc') {
        this.setFilters([{
                field: field,
                type: 'order',
                direction: direction
            }]);
        return this;
    }
    getAllItems(item) {
        return this.execute(item);
    }
    execute(item) {
        let itemIndex = item.constructor.getQuery().getItemIndex(item);
        if (!itemIndex)
            return [];
        let indexKey = `${this.model.table()}.${this.foreignKey}`, hasManyIndex = itemIndex.hasMany[indexKey] || [];
        return this.getQuery()
            .setFilters(this.filters)
            .setFilteredIndex(hasManyIndex)
            .get() || [];
    }
    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`;
    }
}
exports.default = HasMany;
