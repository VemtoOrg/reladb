export default class Cache {
    constructor(database: any);
    database: any;
    tables: {};
    cachedItems: any[];
    cachedRelationships: any[];
    from(item: any): void;
    cacheTablesInformation(): void;
    addTableDataToCache(table: any): void;
    addItemToTableCache(item: any): void;
    cacheItemRelationships(item: any): void;
    setupCacheTable(table: any): void;
    clear(): void;
    isCachingItem(item: any): boolean;
    isCachingRelationship(item: any, relationship: any): boolean;
}
