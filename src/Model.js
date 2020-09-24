import Query from './Query'
import pluralize from 'pluralize'

export default class Model {

    constructor(data = {}) {

        this.fillFromData(data)
    
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

    clearData() {
        Object.keys(this).forEach(key => {
            delete this[key]
        })
    }

    relationships() {
        return {}
    }

    hasMany(model, foreignKey, localKey) {

        return model.where(foreignKey)

    }

    belongsTo(model, foreignKey, localKey) {

        return model.where(foreignKey)

    }

}