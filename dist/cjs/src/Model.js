"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Query_js_1 = __importDefault(require("./Query.js"));
const pluralize_1 = __importDefault(require("pluralize"));
const Resolver_js_1 = __importDefault(require("./Resolver.js"));
const HasOne_js_1 = __importDefault(require("./Relationships/HasOne.js"));
const HasMany_js_1 = __importDefault(require("./Relationships/HasMany.js"));
const MorphTo_js_1 = __importDefault(require("./Relationships/MorphTo.js"));
const change_case_1 = require("change-case");
const MorphMany_js_1 = __importDefault(require("./Relationships/MorphMany.js"));
const BelongsTo_js_1 = __importDefault(require("./Relationships/BelongsTo.js"));
const BelongsToMany_js_1 = __importDefault(require("./Relationships/BelongsToMany.js"));
class Model {
    constructor(data = {}) {
        this.__isRelaDBModel = true;
        this.__returnRelationsAutomatically = true;
        this.__saveDataToStorage = true;
        // Callbacks
        this.__onUpdateListener = null;
        this.__customEventsEnabled = false;
        this.constructor.initFilters();
        this.checkIdentifier();
        this.fillFromData(data);
        return new Proxy(this, {
            set: this.__set,
            get: this.__get
        });
    }
    checkIdentifier() {
        try {
            this.constructor.identifier();
        }
        catch (e) {
            throw e;
        }
        return true;
    }
    static identifier() {
        if (!this.__identifier) {
            throw new Error('Model identifier() method must return a string. Please register an identifier for this model');
        }
        return this.__identifier;
    }
    static setIdentifier(identifier) {
        this.__identifier = identifier;
    }
    static setCustomTableName(table) {
        this.__customTable = table;
    }
    static defaultKeyIdentifier() {
        return (0, change_case_1.camelCase)(this.identifier());
    }
    __set(obj, name, value) {
        obj[name] = value;
        return true;
    }
    __get(obj, name) {
        if (obj.__returnRelationsAutomatically && obj.hasRelationshipNamed(name)) {
            return obj.executeRelationship(name);
        }
        return obj[name];
    }
    disableAutomaticRelations() {
        this.__returnRelationsAutomatically = false;
    }
    enableAutomaticRelations() {
        this.__returnRelationsAutomatically = true;
    }
    disableSavingData() {
        this.__saveDataToStorage = false;
    }
    enableSavingData() {
        this.__saveDataToStorage = true;
    }
    fillFromData(data = {}, disablePrimaryKeyFill = false) {
        let keys = Object.keys(data);
        if (disablePrimaryKeyFill) {
            keys = keys.filter(key => key != this.constructor.primaryKey());
        }
        keys.forEach(key => this[key] = data[key]);
        return this;
    }
    fresh() {
        if (!this.isSaved())
            return null;
        return new Query_js_1.default(this.constructor)
            .findOrFail(this.id);
    }
    static count() {
        return new Query_js_1.default(this).count();
    }
    static create(data = {}) {
        data = JSON.parse(JSON.stringify(data));
        if (this.creating)
            data = this.creating(data);
        let item = new Query_js_1.default(this).create(data);
        if (this.created)
            this.created(item);
        this.fireRelationshipEvents(item, 'created');
        return item;
    }
    static fireRelationshipEvents(item, eventSuffix) {
        let belongsToRelationships = item.belongsToRelationships();
        belongsToRelationships.forEach(relationship => {
            let inverseRelationship = relationship.inverse();
            if (!inverseRelationship)
                return;
            let parentInstance = relationship.getParentFromItem(item);
            if (!parentInstance)
                return;
            let eventName = `${parentInstance.getItemIdentifier()}:${inverseRelationship.getNameOnModel()}:${eventSuffix}`;
            let returnedData = eventSuffix === 'deleted' ? item.getItemIdentifierData() : item;
            Resolver_js_1.default.db().executeCustomEventListener(eventName, returnedData);
            let generalEventName = `${parentInstance.getItemIdentifier()}:${inverseRelationship.getNameOnModel()}:changed`;
            Resolver_js_1.default.db().executeCustomEventListener(generalEventName, returnedData);
            const allRelationshipsEventName = `${parentInstance.getItemIdentifier()}:relationships:changed`;
            Resolver_js_1.default.db().executeCustomEventListener(allRelationshipsEventName, returnedData);
        });
    }
    static get() {
        return new Query_js_1.default(this)
            .setFilters(this.getFilters())
            .get();
    }
    static latest() {
        return new Query_js_1.default(this).findLatest();
    }
    static find(id = null) {
        return new Query_js_1.default(this).find(id);
    }
    static findOrFail(id = null) {
        return new Query_js_1.default(this).findOrFail(id);
    }
    fill(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
        return this;
    }
    save() {
        if (!this.__saveDataToStorage || !Resolver_js_1.default.db().__saveDataToStorage)
            return;
        if (!this.isSaved()) {
            let createdItem = this.constructor.create(this.constructor.removeSpecialData(this));
            this.fillFromData(createdItem);
            return this;
        }
        return this.update(this);
    }
    update(data = {}) {
        if (!this.__saveDataToStorage || !Resolver_js_1.default.db().__saveDataToStorage)
            return;
        if (!this.id) {
            throw new Error('It is not possible to update an object that is not currently saved on database');
        }
        data = JSON.parse(JSON.stringify(data));
        if (this.constructor.beforeUpdate)
            data = this.constructor.beforeUpdate(data, this.fresh());
        if (this.constructor.updating)
            data = this.constructor.updating(data, this.fresh());
        this.fillFromData(data, true);
        let wasUpdated = new Query_js_1.default(this.constructor)
            .update(this.id, this.constructor.removeSpecialData(this));
        if (this.__onUpdateListener)
            this.__onUpdateListener(this);
        if (this.constructor.updated)
            this.constructor.updated(this);
        this.constructor.fireRelationshipEvents(this, 'updated');
        return wasUpdated;
    }
    delete() {
        if (!this.__saveDataToStorage || !Resolver_js_1.default.db().__saveDataToStorage)
            return;
        if (!this.id)
            throw new Error('It is not possible to delete an object that is not currently saved on database');
        if (this.constructor.deleting)
            this.constructor.deleting(this);
        new Query_js_1.default(this.constructor).delete(this.id);
        if (this.constructor.deleted)
            this.constructor.deleted(this.id);
        this.constructor.fireRelationshipEvents(this, 'deleted');
        this.clearData();
        return true;
    }
    static removeSpecialData(data) {
        let filteredData = {}, excludedKeys = [
            '__isRelaDBModel',
            '__onUpdateListener',
            '__saveDataToStorage',
            '__returnRelationsAutomatically',
            '__customEventsEnabled',
        ];
        Object.keys(data).forEach(key => {
            if (!excludedKeys.includes(key)) {
                filteredData[key] = data[key];
            }
        });
        return filteredData;
    }
    static getQuery() {
        return new Query_js_1.default(this);
    }
    static primaryKey() {
        return 'id';
    }
    getTable() {
        return this.constructor.table();
    }
    getItemIdentifier() {
        let pk = this.constructor.primaryKey();
        return `${this.getTable()}:${this[pk]}`;
    }
    getItemIdentifierData() {
        let pk = this.constructor.primaryKey();
        return this[pk];
    }
    getTableData() {
        return new Query_js_1.default(this.constructor)
            .getTableData();
    }
    static table() {
        if (this.__customTable)
            return this.__customTable;
        return this.defaultTable();
    }
    static defaultTable() {
        return (0, pluralize_1.default)((0, change_case_1.snakeCase)(this.identifier())).toLowerCase();
    }
    static timestamps() {
        return true;
    }
    clearData() {
        Object.keys(this).forEach(key => {
            delete this[key];
        });
    }
    relationships() {
        return {};
    }
    hasOne(model, foreignKey = null, localKey = null) {
        return new HasOne_js_1.default(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey);
    }
    hasMany(model, foreignKey = null, localKey = null) {
        return new HasMany_js_1.default(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey);
    }
    belongsTo(model, foreignKey = null, ownerKey = null) {
        return new BelongsTo_js_1.default(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setOwnerKey(ownerKey);
    }
    belongsToMany(model, pivotModel = null, foreignPivotKey = null, relatedPivotKey = null) {
        return new BelongsToMany_js_1.default(model, this.constructor)
            .setItem(this)
            .setPivotModel(pivotModel)
            .setForeignPivotKey(foreignPivotKey)
            .setRelatedPivotKey(relatedPivotKey);
    }
    morphMany(model, name, morphKey = null, morphType = null) {
        return new MorphMany_js_1.default(model, this.constructor)
            .setItem(this)
            .setName(name)
            .setMorphKey(morphKey)
            .setMorphType(morphType);
    }
    morphTo(name, morphKey = null, morphType = null) {
        return new MorphTo_js_1.default()
            .setItem(this)
            .setName(name)
            .setMorphKey(morphKey)
            .setMorphType(morphType);
    }
    hasRelationshipNamed(name) {
        /** As we are calling a method here, it has some special properties, like constructor.
         * So we need to return false if the name matches one of these properties
         */
        let reserved = [
            'constructor', 'apply', 'bind', 'call', 'toString', 'hasOwnProperty', 'isPrototypeOf',
            'propertyIsEnumerable', 'toLocaleString', 'valueOf', '__defineGetter__', '__defineSetter__',
            '__lookupGetter__', '__lookupSetter__'
        ];
        if (reserved.includes(name))
            return false;
        if (!this.getRelationshipFunction(name))
            return false;
        return typeof this.getRelationshipFunction(name) === 'function';
    }
    executeRelationship(name) {
        return this.getRelationship(name).execute();
    }
    hasBelongsToRelationships() {
        return this.belongsToRelationships().length > 0;
    }
    belongsToRelationships() {
        return this.getRelationshipsByInstanceType(BelongsTo_js_1.default);
    }
    belongsToManyRelationships() {
        return this.getRelationshipsByInstanceType(BelongsToMany_js_1.default);
    }
    hasManyRelationships() {
        return this.getRelationshipsByInstanceType(HasMany_js_1.default);
    }
    hasOneRelationships() {
        return this.getRelationshipsByInstanceType(HasOne_js_1.default);
    }
    hasSomethingRelationships() {
        let hasManyRelationships = this.hasManyRelationships(), hasOneRelationships = this.hasOneRelationships();
        return hasManyRelationships.concat(hasOneRelationships);
    }
    morphManyRelationships() {
        return this.getRelationshipsByInstanceType(MorphMany_js_1.default);
    }
    morphToRelationships() {
        return this.getRelationshipsByInstanceType(MorphTo_js_1.default);
    }
    getRelationshipsByInstanceType(instanceOfClass) {
        let relationships = [];
        Object.keys(this.relationships()).forEach(relationshipName => {
            let relationship = this.getRelationship(relationshipName);
            if (relationship instanceof instanceOfClass) {
                relationship.__nameOnModel = relationshipName;
                relationships.push(relationship);
            }
        });
        return relationships;
    }
    relation(name) {
        return this.getRelationship(name);
    }
    getRelationship(name) {
        return this.getRelationshipFunction(name)();
    }
    getRelationshipFunction(name) {
        return this.relationships()[name];
    }
    isSaved() {
        return !!this[this.constructor.primaryKey()];
    }
    hasUnsavedData() {
        const freshInstance = this.fresh();
        if (!freshInstance)
            return true;
        return JSON.stringify(this) !== JSON.stringify(freshInstance);
    }
    static orderBy(field, direction = 'asc') {
        this.clearFilters();
        this.getFilters().push({
            field: field,
            type: 'order',
            direction: direction
        });
        return this;
    }
    static initFilters() {
        if (!Resolver_js_1.default.db().filters[this.table()]) {
            Resolver_js_1.default.db().filters[this.table()] = [];
        }
    }
    static clearFilters() {
        this.initFilters();
        Resolver_js_1.default.db().filters[this.table()] = [];
    }
    static getFilters() {
        this.initFilters();
        return Resolver_js_1.default.db().filters[this.table()];
    }
    onUpdateListener(listener) {
        this.__onUpdateListener = listener;
        return this;
    }
    /**
     *
     * @param {*} name created, updated, deleted
     * @param {*} listener
     * @returns
     */
    addListener(name, listener) {
        let completeName = `${this.getItemIdentifier()}:${name}`;
        Resolver_js_1.default.db().addCustomEventListener(completeName, listener);
        return this;
    }
    /**
     * @param {*} name created, updated, deleted
     */
    removeListener(name) {
        let completeName = `${this.getItemIdentifier()}:${name}`;
        Resolver_js_1.default.db().removeCustomEventListener(completeName);
        return this;
    }
    clearListeners() {
        let completeName = `${this.getItemIdentifier()}:`;
        Resolver_js_1.default.db().removeCustomEventListenersContaining(completeName);
        return this;
    }
}
exports.default = Model;
Model.__identifier = null;
Model.__customTable = null;
