import Query from './Query'
import pluralize from 'pluralize'
import HasMany from './Relationships/HasMany'
import BelongsTo from './Relationships/BelongsTo'
import HasOne from './Relationships/HasOne'

export default class Model {

    static filters = []

    constructor(data = {}) {

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
        if(obj.hasRelationshipNamed(name)) {
            return obj.executeRelationship(name)
        }

        return obj[name]
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
            .setFilters(this.filters)
            .get()
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
        if(!this.isSaved()) {
            return this.constructor.create(this)
        }

        return this.update(this)
    }

    update(data = {}) {
        if(!this.id) {
            throw new Error('It is not possible to update an object that is not currently saved on database')
        }

        if(this.constructor.updating) data = this.constructor.updating(data, this)

        this.fillFromData(data, true)

        let wasUpdated = new Query(this.constructor)
            .update(this.id, this)

        if(this.constructor.updated) this.constructor.updated(this)

        return wasUpdated
    }

    delete() {
        if(!this.id) throw new Error('It is not possible to delete an object that is not currently saved on database')

        if(this.constructor.deleting) this.constructor.deleting(this)

        new Query(this.constructor).delete(this.id)

        if(this.constructor.deleted) this.constructor.deleted(this.id)

        this.clearData()

        return true
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

    static table() {
        return pluralize(this.name).toLowerCase()
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

        this.filters.push({
            field: field,
            type: 'order',
            direction: direction
        })
        
        return this
    }

    static clearFilters() {
        this.filters = []
    }
}