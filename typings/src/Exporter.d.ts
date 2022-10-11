export default class Exporter {
    constructor(database: any);
    database: any;
    cache: Cache;
    from(item: any): Exporter;
    getData(): {
        tables: {};
        exportedItems: any[];
        exportedRelationships: any[];
    };
    toJson(): string;
    clear(): void;
}
import Cache from "./Cache.js";
//# sourceMappingURL=Exporter.d.ts.map