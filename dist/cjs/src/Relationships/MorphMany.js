"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Relationship_js_1 = __importDefault(require("./Relationship.js"));
class MorphMany extends Relationship_js_1.default {
    relationshipType() {
        return 'MorphMany';
    }
    setName(name) {
        this.name = name;
        return this;
    }
    setMorphKey(morphKey) {
        if (!morphKey) {
            morphKey = `${this.name}Id`;
        }
        this.morphKey = morphKey;
        return this;
    }
    setMorphType(morphType) {
        if (!morphType) {
            morphType = `${this.name}Type`;
        }
        this.morphType = morphType;
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
    getAllItems() {
        return this.execute();
    }
    execute() {
        const item = this.getItem(), itemModelIdentifier = item.constructor.identifier();
        let morphItems = this.getQuery()
            .setFilters(this.filters)
            .get();
        morphItems = morphItems.filter(morphItem => {
            return morphItem[this.morphType] === itemModelIdentifier && morphItem[this.morphKey] === item.id;
        });
        return morphItems || [];
    }
    signature() {
        return `${this.localModel.identifier()}->MorphMany(${this.model.identifier()}):${this.morphKey},${this.morphType}`;
    }
}
exports.default = MorphMany;
