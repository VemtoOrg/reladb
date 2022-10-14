"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const HasMany_js_1 = __importDefault(require("./HasMany.js"));
class HasOne extends HasMany_js_1.default {
    relationshipType() {
        return 'HasOne';
    }
    getAllItems(item) {
        return super.execute(item);
    }
    execute(item) {
        return super.execute(item)[0];
    }
    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`;
    }
}
exports.default = HasOne;
