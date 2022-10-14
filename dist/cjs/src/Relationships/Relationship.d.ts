export default class Relationship {
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
    setNameOnModel(name: any): Relationship;
    __nameOnModel: any;
    getNameOnModel(): any;
}
import Query from "../Query.js";
