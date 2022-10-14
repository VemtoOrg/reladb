"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const Resolver_js_1 = __importDefault(require("./Resolver.js"));
class Command {
    constructor(command, data = null, id = null) {
        this.id = id || (0, uuid_1.v4)();
        this.command = command;
        this.data = data;
    }
    updateDataFromCommand(command) {
        this.data = command.data;
        return this;
    }
    execute() {
        try {
            Resolver_js_1.default.db().markAsExecuting(this);
            this.executeParsedCommand();
            Resolver_js_1.default.db().removeCommand(this);
        }
        catch (error) {
            if (Resolver_js_1.default.db().mode === 'development') {
                throw error;
            }
            Resolver_js_1.default.db().removeCommand(this);
        }
    }
    executeParsedCommand() {
        if (this.command === 'clear')
            return Resolver_js_1.default.db().driver.clear();
        let parsed = this.parseCommand();
        if (parsed.type === 'set') {
            Resolver_js_1.default.db().driver.setTable(parsed.table).set(parsed.key, this.data);
        }
        if (parsed.type === 'remove') {
            Resolver_js_1.default.db().driver.setTable(parsed.table).remove(parsed.key);
        }
    }
    parseCommand() {
        let validCommands = ['set', 'remove'], validPrepositions = ['on', 'from'];
        let sections = this.command.split(' ');
        if (!validCommands.includes(sections[0]))
            throw new Error('Please specify a valid command');
        if (!validPrepositions.includes(sections[2]))
            throw new Error('Please specify a valid command');
        return {
            type: sections[0],
            key: sections[1],
            table: sections[3],
        };
    }
}
exports.default = Command;
