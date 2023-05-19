export default class BelongsToMany extends Relationship {
    setPivotModel(pivotModel: any): BelongsToMany;
    pivotModel: any;
    setForeignPivotKey(foreignPivotKey: any): BelongsToMany;
    foreignPivotKey: any;
    setRelatedPivotKey(relatedPivotKey: any): BelongsToMany;
    relatedPivotKey: any;
    cascadeDetach(): BelongsToMany;
    usesCascadeDetach: boolean;
    orderBy(field: any, direction?: string): BelongsToMany;
    getAllItems(): any;
    execute(): any;
    getPivotItems(): any;
    signature(): string;
    attachUnique(relatedItem: any, extraData?: any): any;
    attach(relatedItem: any, extraData?: any): any;
    detachAllOcurrences(relatedItem: any): any;
    detachAll(): any;
    detach(relatedItem: any): any;
    has(relatedItem: any): boolean;
    getPivotItem(relatedItem: any): any;
}
import Relationship from "./Relationship.js";
