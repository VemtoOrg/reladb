export default class Importer {
    constructor(database: any);
    database: any;
    setup(): void;
    importedItems: any[];
    importingData: any;
    importedItemsMap: {};
    importerModel: typeof ImporterModel;
    fromJson(jsonData: any): void;
    fromData(data: any): void;
    importData(): void;
    importItem(id: any, table: any): any;
    importHasManyRelationshipsItems(originalItemId: any, originalItemTable: any, importedItem: any): void;
    getTableDataWithImportedItemIndex(originalItemTable: any, importedItem: any, indexName: any): any;
    finish(): void;
}
import ImporterModel from "./ImporterModel.js";
//# sourceMappingURL=Importer.d.ts.map