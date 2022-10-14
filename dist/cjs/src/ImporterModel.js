"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Model_js_1 = __importDefault(require("./Model.js"));
class ImporterModel extends Model_js_1.default {
    static identifier() {
        return 'ImporterModel';
    }
}
exports.default = ImporterModel;
