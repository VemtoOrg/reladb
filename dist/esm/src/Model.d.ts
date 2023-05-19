export default class Model {
    static __identifier: any;
    static __customTable: any;
    static identifier(): any;
    static setIdentifier(identifier: any): void;
    static setCustomTableName(table: any): void;
    static defaultKeyIdentifier(): string;
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
    static defaultTable(): any;
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
    checkIdentifier(): boolean;
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
    belongsToMany(model: any, pivotModel?: any, foreignPivotKey?: any, relatedPivotKey?: any): BelongsToMany;
    morphMany(model: any, name: any, morphKey?: any, morphType?: any): MorphMany;
    morphTo(name: any, morphKey?: any, morphType?: any): MorphTo;
    hasRelationshipNamed(name: any): boolean;
    executeRelationship(name: any): any;
    hasBelongsToRelationships(): boolean;
    belongsToRelationships(): any[];
    belongsToManyRelationships(): any[];
    hasManyRelationships(): any[];
    hasOneRelationships(): any[];
    hasSomethingRelationships(): any[];
    morphManyRelationships(): any[];
    morphToRelationships(): any[];
    getRelationshipsByInstanceType(instanceOfClass: any): any[];
    relation(name: any): any;
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
import BelongsToMany from "./Relationships/BelongsToMany.js";
import MorphMany from "./Relationships/MorphMany.js";
import MorphTo from "./Relationships/MorphTo.js";
import Query from "./Query.js";
