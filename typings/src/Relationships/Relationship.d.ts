export = Relationship;
declare class Relationship {
    constructor(model: any, localModel: any);
    model: any;
    localModel: any;
    filters: any[];
    type: string;
    relationshipType(): string;
    getQuery(): Query;
    setFilters(filters: any): void;
    getModelIdentifier(): string;
    getItemModelIdentifier(item: any): string;
    setNameOnModel(name: any): import("./Relationship.js");
    __nameOnModel: any;
    getNameOnModel(): any;
}
import Query = require("../Query.js");
//# sourceMappingURL=Relationship.d.ts.map