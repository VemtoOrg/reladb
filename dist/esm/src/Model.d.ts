export default class Model {
    static count(): any;
    static create(data?: {}): any;
    static fireRelationshipEvents(item: any, eventSuffix: any): void;
    static get(): any;
    static latest(): any;
    static find(id?: any): any;
    static findOrFail(id?: any): any;
    static removeSpecialData(data: any): {};
    static getQuery(): Query;
    static primaryKey(): string;
    static table(): any;
    static timestamps(): boolean;
    static orderBy(field: any, direction?: string): typeof Model;
    static initFilters(): void;
    static clearFilters(): void;
    static getFilters(): any;
    constructor(data?: {});
    __isRelaDBModel: boolean;
    __returnRelationsAutomatically: boolean;
    __saveDataToStorage: boolean;
    __onUpdateListener: any;
    __customEventsEnabled: boolean;
    __set(obj: any, name: any, value: any): boolean;
    __get(obj: any, name: any): any;
    disableAutomaticRelations(): void;
    enableAutomaticRelations(): void;
    disableSavingData(): void;
    enableSavingData(): void;
    fillFromData(data?: {}, disablePrimaryKeyFill?: boolean): Model;
    fresh(): any;
    fill(data: any): Model;
    save(): boolean | Model;
    update(data?: {}): boolean;
    delete(): boolean;
    getTable(): any;
    getItemIdentifier(): string;
    getItemIdentifierData(): any;
    getTableData(): any;
    clearData(): void;
    relationships(): {};
    hasOne(model: any, foreignKey?: any, localKey?: any): HasOne;
    hasMany(model: any, foreignKey?: any, localKey?: any): HasMany;
    belongsTo(model: any, foreignKey?: any, ownerKey?: any): BelongsTo;
    hasRelationshipNamed(name: any): boolean;
    executeRelationship(name: any): any;
    hasBelongsToRelationships(): boolean;
    belongsToRelationships(): any[];
    hasManyRelationships(): any[];
    hasOneRelationships(): any[];
    hasSomethingRelationships(): any[];
    getRelationshipsByInstanceType(instanceOfClass: any): any[];
    getRelationship(name: any): any;
    getRelationshipFunction(name: any): any;
    isSaved(): boolean;
    onUpdateListener(listener: any): Model;
    /**
     *
     * @param {*} name created, updated, deleted
     * @param {*} listener
     * @returns
     */
    addListener(name: any, listener: any): Model;
    /**
     * @param {*} name created, updated, deleted
     */
    removeListener(name: any): Model;
}
import HasOne from "./Relationships/HasOne.js";
import HasMany from "./Relationships/HasMany.js";
import BelongsTo from "./Relationships/BelongsTo.js";
import Query from "./Query.js";
