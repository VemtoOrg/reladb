export = Command;
declare class Command {
    constructor(command: any, data?: any, id?: any);
    id: any;
    command: any;
    data: any;
    updateDataFromCommand(command: any): import("./Command.js");
    execute(): void;
    executeParsedCommand(): any;
    parseCommand(): {
        type: any;
        key: any;
        table: any;
    };
}
//# sourceMappingURL=Command.d.ts.map