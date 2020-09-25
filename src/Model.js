import Query from './Query'
import pluralize from 'pluralize'
import HasMany from './Relationships/HasMany'
import BelongsTo from './Relationships/BelongsTo'

export default class Model {

    constructor(data = {}) {

        this.fillFromData(data)

        return new Proxy(this, {
            set: this.__set,
            get: this.__get
        })

    }

    __set(obj, name, value) {
        return obj[name] = value
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

    static create(data = {}) {
        return new Query(this).create(data)
    }

    static get() {
        return new Query(this).get()
    }

    static find(id = null) {
        return new Query(this).find(id)
    }

    static findOrFail(id = null) {
        return new Query(this).findOrFail(id)
    }

    update(data = {}) {
        if(!this.id) {
            throw new Error('It is not possible to update an object that is not currently saved on database')
        }

        this.fillFromData(data, true)

        return new Query(this.constructor)
            .update(this.id, this)
    }

    delete() {
        if(!this.id) throw new Error('It is not possible to delete an object that is not currently saved on database')

        new Query(this.constructor).delete(this.id)

        this.clearData()

        return true
    }

    static getQuery() {
        return new Query(this)
    }

    static primaryKey() {
        return 'id'
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

    hasMany(model, foreignKey, localKey) {
        return new HasMany(model)
            .setForeignKey(foreignKey)
            .setLocalKey(localKey)
    }

    belongsTo(model, foreignKey, ownerKey) {
        return new BelongsTo(model)
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
        
        if(!this.relationships()[name]) return false

        return typeof this.relationships()[name] === 'function'
    }

    executeRelationship(name) {
        console.log(name, this.name, this.relationships())
        return this.relationships()[name]().execute()
    }

}