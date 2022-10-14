export default class BelongsTo extends Relationship {
    atMostOne(): BelongsTo;
    allowsOnlyOne: boolean;
    setForeignKey(foreignKey: any): BelongsTo;
    foreignKey: any;
    setOwnerKey(ownerKey: any): BelongsTo;
    ownerKey: any;
    getParentFromItem(item: any): any;
    execute(item: any): any;
    signature(): string;
    inverse(): any;
}
import Relationship from "./Relationship.js";
