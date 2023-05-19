export default class Relationship {
    constructor(model: any, localModel: any);
    model: any;
    localModel: any;
    item: any;
    filters: any[];
    type: string;
    relationshipType(): string;
    getQuery(): Query;
    setItem(item: any): Relationship;
    getItem(): any;
    setFilters(filters: any): void;
    getModelIdentifier(): string;
    getItemModelIdentifier(): string;
    setNameOnModel(name: any): Relationship;
    __nameOnModel: any;
    getNameOnModel(): any;
}
import Query from "../Query.js";
