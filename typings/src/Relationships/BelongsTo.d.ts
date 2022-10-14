export = BelongsTo;
declare class BelongsTo extends Relationship {
    atMostOne(): import("./BelongsTo.js");
    allowsOnlyOne: boolean;
    setForeignKey(foreignKey: any): import("./BelongsTo.js");
    foreignKey: any;
    setOwnerKey(ownerKey: any): import("./BelongsTo.js");
    ownerKey: any;
    getParentFromItem(item: any): any;
    execute(item: any): any;
    signature(): string;
    inverse(): any;
}
import Relationship = require("./Relationship.js");
//# sourceMappingURL=BelongsTo.d.ts.map