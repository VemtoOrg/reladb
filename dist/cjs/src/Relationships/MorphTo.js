"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Resolver_js_1 = __importDefault(require("../Resolver.js"));
const Relationship_js_1 = __importDefault(require("./Relationship.js"));
class MorphTo extends Relationship_js_1.default {
    relationshipType() {
        return 'MorphTo';
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
    getParentFromItem() {
        const item = this.getItem();
        if (!item[this.morphKey] || !item[this.morphType])
            return null;
        const morphType = item[this.morphType], model = Resolver_js_1.default.db().getModel(morphType);
        return model.find(item[this.morphKey]);
    }
    execute() {
        return this.getParentFromItem();
    }
    signature() {
        return `${this.localModel.identifier()}->MorphTo(${this.name}):${this.morphKey},${this.morphType}`;
    }
}
exports.default = MorphTo;
