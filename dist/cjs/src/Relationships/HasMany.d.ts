export default class HasMany extends Relationship {
    setForeignKey(foreignKey: any): HasMany;
    foreignKey: any;
    setLocalKey(localKey: any): HasMany;
    localKey: any;
    cascadeDelete(): HasMany;
    usesCascadeDelete: boolean;
    orderBy(field: any, direction?: string): HasMany;
    getAllItems(): any;
    execute(): any;
    signature(): string;
}
import Relationship from "./Relationship.js";
