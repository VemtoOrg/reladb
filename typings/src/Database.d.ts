export = Database;
declare class Database {
    /** @type Driver */
    driver: Driver;
    events: {};
    filters: any[];
    deletingBuffer: {};
    commands: any[];
    addingCommand: boolean;
    executingCommandId: any;
    tableCallbacks: {};
    __customEventsListeners: {};
    __databaseDataChangedEventListener: any;
    cache: Cache;
    onCacheMode: boolean;
    importer: Importer;
    exporter: Exporter;
    settings: {
        addCommandToQueueOnDispatch: boolean;
    };
    __saveDataToStorage: boolean;
    addCustomEventListener(name: any, listener: any): void;
    removeCustomEventListener(name: any): void;
    executeCustomEventListener(name: any, ...data: any[]): void;
    onDataChanged(callback: any): void;
    executeDataChangedEventListener(): void;
    disableSavingData(): void;
    enableSavingData(): void;
    setDriver(driver: any): void;
    isAlreadyDeleting(table: any, id: any): boolean;
    addToDeletingBuffer(table: any, id: any): void;
    removeFromDeletingBuffer(table: any, id: any): void;
    registerDeletingBufferListener(listenerFunction: any): void;
    deletingBufferListener: any;
    cloneProperty(property: any): any;
    cacheFrom(item: any): void;
    stopCaching(): void;
    isCaching(): boolean;
    dispatchCommand(cmd: any, data?: any): Command;
    isExecutingCommands(): boolean;
    canExecuteCommands(): boolean;
    isAddingCommands(): boolean;
    markAsExecuting(command: any): void;
    markAsNotExecuting(): void;
    addCommand(command: any): void;
    getSimilarCommands(baseCommand: any): any[];
    removeCommand(command: any): void;
    executeNextCommand(): void;
    onUpdateTable(table: any, callback: any): void;
    executeOnUpdateCallbackForTable(table: any, data: any): void;
}
declare namespace Database {
    export { Driver };
}
type Driver = import('./Drivers/Driver');
import Cache = require("./Cache.js");
import Importer = require("./Importer.js");
import Exporter = require("./Exporter.js");
import Command = require("./Command.js");
//# sourceMappingURL=Database.d.ts.map