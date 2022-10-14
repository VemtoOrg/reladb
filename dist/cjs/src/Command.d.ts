export default class Command {
    constructor(command: any, data?: any, id?: any);
    id: any;
    command: any;
    data: any;
    updateDataFromCommand(command: any): Command;
    execute(): void;
    executeParsedCommand(): any;
    parseCommand(): {
        type: any;
        key: any;
        table: any;
    };
}
