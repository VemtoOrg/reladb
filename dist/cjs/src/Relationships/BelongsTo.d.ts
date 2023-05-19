export default class BelongsTo extends Relationship {
    atMostOne(): BelongsTo;
    allowsOnlyOne: boolean;
    setForeignKey(foreignKey: any): BelongsTo;
    foreignKey: any;
    setOwnerKey(ownerKey: any): BelongsTo;
    ownerKey: any;
    getParentFromItem(): any;
    execute(): any;
    signature(): string;
    /**
     * Gets the inverse relationship for firing events (only works for BelongsTo/HasMany relationships)
     * @returns {Relationship}
     */
    inverse(): Relationship;
}
import Relationship from "./Relationship.js";
