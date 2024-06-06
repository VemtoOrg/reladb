import Query from './Query.js';
import pluralize from 'pluralize';
import Resolver from './Resolver.js';
import HasOne from './Relationships/HasOne.js';
import HasMany from './Relationships/HasMany.js';
import MorphTo from './Relationships/MorphTo.js';
import { camelCase, snakeCase } from 'change-case';
import MorphMany from './Relationships/MorphMany.js';
import BelongsTo from './Relationships/BelongsTo.js';
import BelongsToMany from './Relationships/BelongsToMany.js';
export default class Model {
    static __identifier = null;
    static __customTable = null;
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
        return camelCase(this.identifier());
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
    refresh() {
        let freshData = this.fresh();
        if (!freshData)
            return;
        freshData = JSON.parse(JSON.stringify(freshData));
        freshData = this.constructor.removeSpecialData(freshData);
        this.fillFromData(freshData, true);
        return this;
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
        return new Query(this.constructor)
            .findOrFail(this.id);
    }
    static count() {
        return new Query(this).count();
    }
    static create(data = {}) {
        data = JSON.parse(JSON.stringify(data));
        if (this.creating)
            data = this.creating(data);
        let item = new Query(this).create(data);
        if (this.created)
            this.created(item);
        this.fireGlobalEvents(item, 'created');
        return item;
    }
    static fireGlobalEvents(item, eventSuffix) {
        // We don't fire the created event because we can't listen to it before the item is created
        if (eventSuffix !== 'created') {
            let eventName = `${item.getItemIdentifier()}:${eventSuffix}`;
            Resolver.db().executeCustomEventListener(eventName, item);
            let generalEventName = `${item.getItemIdentifier()}:changed`;
            Resolver.db().executeCustomEventListener(generalEventName, item);
        }
        this.fireRelationshipsEvents(item, eventSuffix);
    }
    static fireRelationshipsEvents(item, eventSuffix) {
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
            Resolver.db().executeCustomEventListener(eventName, returnedData);
            let generalEventName = `${parentInstance.getItemIdentifier()}:${inverseRelationship.getNameOnModel()}:changed`;
            Resolver.db().executeCustomEventListener(generalEventName, returnedData);
            const allRelationshipsEventName = `${parentInstance.getItemIdentifier()}:relationships:changed`;
            Resolver.db().executeCustomEventListener(allRelationshipsEventName, returnedData);
        });
    }
    static get() {
        return new Query(this)
            .setFilters(this.getFilters())
            .get();
    }
    static latest() {
        return new Query(this).findLatest();
    }
    static find(id = null) {
        return new Query(this).find(id);
    }
    static findOrFail(id = null) {
        return new Query(this).findOrFail(id);
    }
    fill(data) {
        Object.keys(data).forEach(key => this[key] = data[key]);
        return this;
    }
    save() {
        if (!this.__saveDataToStorage || !Resolver.db().__saveDataToStorage)
            return;
        if (!this.isSaved()) {
            let createdItem = this.constructor.create(this.constructor.removeSpecialData(this));
            this.fillFromData(createdItem);
            return this;
        }
        return this.update(this);
    }
    update(data = {}) {
        if (!this.__saveDataToStorage || !Resolver.db().__saveDataToStorage)
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
        let wasUpdated = new Query(this.constructor)
            .update(this.id, this.constructor.removeSpecialData(this));
        if (this.__onUpdateListener)
            this.__onUpdateListener(this);
        if (this.constructor.updated)
            this.constructor.updated(this);
        this.constructor.fireGlobalEvents(this, 'updated');
        return wasUpdated;
    }
    delete() {
        if (!this.__saveDataToStorage || !Resolver.db().__saveDataToStorage)
            return;
        if (!this.id)
            throw new Error('It is not possible to delete an object that is not currently saved on database');
        if (this.constructor.deleting)
            this.constructor.deleting(this);
        new Query(this.constructor).delete(this.id);
        if (this.constructor.deleted)
            this.constructor.deleted(this.id);
        this.constructor.fireGlobalEvents(this, 'deleted');
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
        return new Query(this);
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
        return new Query(this.constructor)
            .getTableData();
    }
    static table() {
        if (this.__customTable)
            return this.__customTable;
        return this.defaultTable();
    }
    static defaultTable() {
        return pluralize(snakeCase(this.identifier())).toLowerCase();
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
        return new HasOne(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey);
    }
    hasMany(model, foreignKey = null, localKey = null) {
        return new HasMany(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey);
    }
    belongsTo(model, foreignKey = null, ownerKey = null) {
        return new BelongsTo(model, this.constructor)
            .setItem(this)
            .setForeignKey(foreignKey)
            .setOwnerKey(ownerKey);
    }
    belongsToMany(model, pivotModel = null, foreignPivotKey = null, relatedPivotKey = null) {
        return new BelongsToMany(model, this.constructor)
            .setItem(this)
            .setPivotModel(pivotModel)
            .setForeignPivotKey(foreignPivotKey)
            .setRelatedPivotKey(relatedPivotKey);
    }
    morphMany(model, name, morphKey = null, morphType = null) {
        return new MorphMany(model, this.constructor)
            .setItem(this)
            .setName(name)
            .setMorphKey(morphKey)
            .setMorphType(morphType);
    }
    morphTo(name, morphKey = null, morphType = null) {
        return new MorphTo()
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
        return this.getRelationshipsByInstanceType(BelongsTo);
    }
    belongsToManyRelationships() {
        return this.getRelationshipsByInstanceType(BelongsToMany);
    }
    hasManyRelationships() {
        return this.getRelationshipsByInstanceType(HasMany);
    }
    hasOneRelationships() {
        return this.getRelationshipsByInstanceType(HasOne);
    }
    hasSomethingRelationships() {
        let hasManyRelationships = this.hasManyRelationships(), hasOneRelationships = this.hasOneRelationships();
        return hasManyRelationships.concat(hasOneRelationships);
    }
    morphManyRelationships() {
        return this.getRelationshipsByInstanceType(MorphMany);
    }
    morphToRelationships() {
        return this.getRelationshipsByInstanceType(MorphTo);
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
        if (!Resolver.db().filters[this.table()]) {
            Resolver.db().filters[this.table()] = [];
        }
    }
    static clearFilters() {
        this.initFilters();
        Resolver.db().filters[this.table()] = [];
    }
    static getFilters() {
        this.initFilters();
        return Resolver.db().filters[this.table()];
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
        const listenerId = Resolver.db().addCustomEventListener(completeName, listener);
        return listenerId;
    }
    removeListener(id) {
        Resolver.db().removeCustomEventListenerById(id);
        return this;
    }
    /**
     * @param {*} name
     */
    removeListenersByName(name) {
        let completeName = `${this.getItemIdentifier()}:${name}`;
        Resolver.db().removeCustomEventListenersByName(completeName);
        return this;
    }
    clearListeners() {
        let completeName = `${this.getItemIdentifier()}:`;
        Resolver.db().removeCustomEventListenersContaining(completeName);
        return this;
    }
}
