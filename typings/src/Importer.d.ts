export = Importer;
declare class Importer {
    constructor(database: any);
    database: any;
    setup(): void;
    importedItems: any[];
    importingData: any;
    importedItemsMap: {};
    importerModel: {
        new (data?: {}): ImporterModel;
        identifier(): string;
        count(): any;
        create(data?: {}): any;
        fireRelationshipEvents(item: any, eventSuffix: any): void;
        get(): any;
        latest(): any;
        find(id?: any): any;
        findOrFail(id?: any): any;
        removeSpecialData(data: any): {};
        getQuery(): Query;
        primaryKey(): string;
        table(): any;
        timestamps(): boolean;
        orderBy(field: any, direction?: string): {
            new (data?: {}): import("./Model.js");
            count(): any;
            create(data?: {}): any;
            fireRelationshipEvents(item: any, eventSuffix: any): void;
            get(): any;
            latest(): any;
            find(id?: any): any;
            findOrFail(id?: any): any;
            removeSpecialData(data: any): {};
            getQuery(): Query;
            primaryKey(): string;
            table(): any;
            timestamps(): boolean;
            orderBy(field: any, direction?: string): any;
            initFilters(): void;
            clearFilters(): void;
            getFilters(): any;
        };
        initFilters(): void;
        clearFilters(): void;
        getFilters(): any;
    };
    fromJson(jsonData: any): void;
    fromData(data: any): void;
    importData(): void;
    importItem(id: any, table: any): any;
    importHasManyRelationshipsItems(originalItemId: any, originalItemTable: any, importedItem: any): void;
    getTableDataWithImportedItemIndex(originalItemTable: any, importedItem: any, indexName: any): any;
    finish(): void;
}
import ImporterModel = require("./ImporterModel.js");
import Query = require("./Query.js");
//# sourceMappingURL=Importer.d.ts.map