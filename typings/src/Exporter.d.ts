export = Exporter;
declare class Exporter {
    constructor(database: any);
    database: any;
    cache: Cache;
    from(item: any): import("./Exporter.js");
    getData(): {
        tables: {};
        exportedItems: any[];
        exportedRelationships: any[];
    };
    toJson(): string;
    clear(): void;
}
import Cache = require("./Cache.js");
//# sourceMappingURL=Exporter.d.ts.map