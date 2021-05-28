const Query = require('./Query')
const pluralize = require('pluralize')
const HasOne = require('./Relationships/HasOne')
const HasMany = require('./Relationships/HasMany')
const BelongsTo = require('./Relationships/BelongsTo')

module.exports = class Model {

    constructor(data = {}) {

        this.__returnRelationsAutomatically = true
        this.__saveDataToStorage = true

        // Callbacks
        this.__onUpdateCallback = null

        this.constructor.initFilters()
        
        if(!this.constructor.hasOwnProperty('identifier')) {
            throw new Error('Model does not have an identifier. Please declare a static identifier() method')
        }

        this.fillFromData(data)

        return new Proxy(this, {
            set: this.__set,
            get: this.__get
        })

    }

    __set(obj, name, value) {
        obj[name] = value
        
        return true
    }

    __get(obj, name) {
        if(obj.__returnRelationsAutomatically && obj.hasRelationshipNamed(name)) {
            return obj.executeRelationship(name)
        }

        return obj[name]
    }

    disableAutomaticRelations() {
        this.__returnRelationsAutomatically = false
    }

    enableAutomaticRelations() {
        this.__returnRelationsAutomatically = true
    }

    disableSavingData() {
        this.__saveDataToStorage = false
    }

    enableSavingData() {
        this.__saveDataToStorage = true
    }

    fillFromData(data = {}, disablePrimaryKeyFill = false) {
        let keys = Object.keys(data)
        
        if(disablePrimaryKeyFill) {
            keys = keys.filter(key => key != this.constructor.primaryKey())
        }
            
        keys.forEach(key => this[key] = data[key])

        return this
    }

    fresh() {
        return new Query(this.constructor)
            .findOrFail(this.id)
    }

    static count() {
        return new Query(this).count()
    }

    static create(data = {}) {
        if(this.creating) data = this.creating(data)
        
        let item = new Query(this).create(data)
        
        if(this.created) this.created(item)
        
        return item
    }

    static get() {
        return new Query(this)
            .setFilters(this.getFilters())
            .get()
    }

    static latest() {
        return new Query(this).findLatest()
    }

    static find(id = null) {
        return new Query(this).find(id)
    }

    static findOrFail(id = null) {
        return new Query(this).findOrFail(id)
    }

    fill(data) {
        Object.keys(data).forEach(key => this[key] = data[key])
        return this
    }

    save() {
        if(!this.__saveDataToStorage || !window.RelaDB.__saveDataToStorage) return

        if(!this.isSaved()) {
            let createdItem = this.constructor.create(this.constructor.removeSpecialData(this))
            this.fillFromData(createdItem)
            return this
        }

        return this.update(this)
    }

    update(data = {}) {
        if(!this.__saveDataToStorage || !window.RelaDB.__saveDataToStorage) return

        if(!this.id) {
            throw new Error('It is not possible to update an object that is not currently saved on database')
        }

        if(this.constructor.updating) data = this.constructor.updating(data, this.fresh())

        this.fillFromData(data, true)

        let wasUpdated = new Query(this.constructor)
            .update(this.id, this.constructor.removeSpecialData(this))

        if(this.__onUpdateCallback) this.__onUpdateCallback(this)
        if(this.constructor.updated) this.constructor.updated(this)

        return wasUpdated
    }

    delete() {
        if(!this.__saveDataToStorage || !window.RelaDB.__saveDataToStorage) return
        
        if(!this.id) throw new Error('It is not possible to delete an object that is not currently saved on database')

        if(this.constructor.deleting) this.constructor.deleting(this)

        new Query(this.constructor).delete(this.id)

        if(this.constructor.deleted) this.constructor.deleted(this.id)

        this.clearData()

        return true
    }

    static removeSpecialData(data) {
        let filteredData = {},
            excludedKeys = [
                '__onUpdateCallback',
                '__saveDataToStorage',
                '__returnRelationsAutomatically',
            ]

        Object.keys(data).forEach(key => {
            if(!excludedKeys.includes(key)) {
                filteredData[key] = data[key]
            }
        })

        return filteredData
    }

    static getQuery() {
        return new Query(this)
    }

    static primaryKey() {
        return 'id'
    }

    getTable() {
        return this.constructor.table()
    }

    getItemIdentifier() {
        let pk = this.constructor.primaryKey()
        return `${this.getTable()}:${this[pk]}`
    }

    getTableData() {
        return new Query(this.constructor)
            .getTableData()
    }

    static table() {
        return pluralize(this.identifier()).toLowerCase()
    }

    static timestamps() {
        return true;
    }

    clearData() {
        Object.keys(this).forEach(key => {
            delete this[key]
        })
    }

    relationships() {
        return {}
    }

    hasOne(model, foreignKey, localKey) {
        return new HasOne(model, this.constructor)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey)
    }

    hasMany(model, foreignKey, localKey) {
        return new HasMany(model, this.constructor)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey)
    }

    belongsTo(model, foreignKey, ownerKey) {
        return new BelongsTo(model, this.constructor)
            .setForeignKey(foreignKey)
            .setOwnerKey(ownerKey)
    }

    hasRelationshipNamed(name) {
        /** As we are calling a method here, it has some special properties, like constructor.
         * So we need to return false if the name matches one of these properties
         */
        let reserved = [
            'constructor', 'apply', 'bind', 'call', 'toString', 'hasOwnProperty', 'isPrototypeOf',
            'propertyIsEnumerable', 'toLocaleString', 'valueOf', '__defineGetter__', '__defineSetter__',
            '__lookupGetter__', '__lookupSetter__'
        ]

        if(reserved.includes(name)) return false

        if(!this.getRelationshipFunction(name)) return false

        return typeof this.getRelationshipFunction(name) === 'function'
    }

    executeRelationship(name) {
        return this.getRelationship(name).execute(this)
    }

    hasBelongsToRelationships() {
        return this.belongsToRelationships().length > 0   
    }

    belongsToRelationships() {
        return this.getRelationshipsByInstanceType(BelongsTo)
    }

    hasManyRelationships() {
        return this.getRelationshipsByInstanceType(HasMany)
    }

    hasOneRelationships() {
        return this.getRelationshipsByInstanceType(HasOne)
    }

    hasSomethingRelationships() {
        let hasManyRelationships = this.hasManyRelationships(),
            hasOneRelationships = this.hasOneRelationships()

        return hasManyRelationships.concat(hasOneRelationships)
    }
    
    getRelationshipsByInstanceType(instanceOfClass) {
        let relationships = []

        Object.keys(this.relationships()).forEach(relationshipName => {
            let relationship = this.getRelationship(relationshipName)
            if(relationship instanceof instanceOfClass) {
                relationship.__nameOnModel = relationshipName
                relationships.push(relationship)
            }
        })
        
        return relationships
    }

    getRelationship(name) {
        return this.getRelationshipFunction(name)()
    }

    getRelationshipFunction(name) {
        return this.relationships()[name]
    }

    isSaved() {
        return !! this[this.constructor.primaryKey()]
    }

    static orderBy(field, direction = 'asc') {
        this.clearFilters()

        this.getFilters().push({
            field: field,
            type: 'order',
            direction: direction
        })
        
        return this
    }

    static initFilters() {
        if(!window.RelaDB.filters[this.table()]) {
            window.RelaDB.filters[this.table()] = []
        }
    }

    static clearFilters() {
        this.initFilters()
        window.RelaDB.filters[this.table()] = []
    }

    static getFilters() {
        this.initFilters()
        return window.RelaDB.filters[this.table()]
    }

    onUpdate(callback) {
        this.__onUpdateCallback = callback
        return this
    }
}