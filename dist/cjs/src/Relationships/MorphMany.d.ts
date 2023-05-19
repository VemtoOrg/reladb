export default class MorphMany extends Relationship {
    setName(name: any): MorphMany;
    name: any;
    setMorphKey(morphKey: any): MorphMany;
    morphKey: any;
    setMorphType(morphType: any): MorphMany;
    morphType: any;
    cascadeDelete(): MorphMany;
    usesCascadeDelete: boolean;
    orderBy(field: any, direction?: string): MorphMany;
    getAllItems(): any;
    execute(): any;
    signature(): string;
}
import Relationship from "./Relationship.js";
