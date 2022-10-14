export = HasMany;
declare class HasMany extends Relationship {
    setForeignKey(foreignKey: any): import("./HasMany.js");
    foreignKey: any;
    setLocalKey(localKey: any): import("./HasMany.js");
    localKey: any;
    cascadeDelete(): import("./HasMany.js");
    usesCascadeDelete: boolean;
    orderBy(field: any, direction?: string): import("./HasMany.js");
    getAllItems(item: any): any;
    execute(item: any): any;
    signature(): string;
}
import Relationship = require("./Relationship.js");
//# sourceMappingURL=HasMany.d.ts.map