import { v4 as uuidv4 } from 'uuid';
import Resolver from './Resolver.js';
export default class Command {
    constructor(command, data = null, id = null) {
        this.id = id || uuidv4();
        this.command = command;
        this.data = data;
    }
    updateDataFromCommand(command) {
        this.data = command.data;
        return this;
    }
    execute() {
        try {
            Resolver.db().markAsExecuting(this);
            this.executeParsedCommand();
            Resolver.db().removeCommand(this);
        }
        catch (error) {
            if (Resolver.db().mode === 'development') {
                throw error;
            }
            Resolver.db().removeCommand(this);
        }
    }
    executeParsedCommand() {
        if (this.command === 'clear')
            return Resolver.db().driver.clear();
        let parsed = this.parseCommand();
        if (parsed.type === 'set') {
            Resolver.db().driver.setTable(parsed.table).set(parsed.key, this.data);
        }
        if (parsed.type === 'remove') {
            Resolver.db().driver.setTable(parsed.table).remove(parsed.key);
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
