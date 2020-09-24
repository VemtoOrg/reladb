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
        let tableData = this.getTableData(),
            id = ++tableData.lastPrimaryKey

        data[this.primaryKey()] = id
        
        this.saveItem(id, data)

        tableData.count++
        tableData.index[data.id] = this.indexStructure()
        
        this.saveTableData(tableData)

        return new this(data)
    }

    static get() {
        try {
            let data = [],
                tableData = this.getTableData()

            // Dá para filtrar aqui passando apenas os índices necessários,
            // ou seja, se estiver vindo através de um relacionamento, eu troco
            // o índice da tabela apenas pelo índice necessário e faço o get após isso. Qualquer operação, seja um limit, um order, etc, deverá simplesmente retornar os índices, que serão jogados posteriormente aqui no get (isso pode ser implementado em uma classe separada de query)
            Object.keys(tableData.index).forEach(id => {
                let item = null
                if(item = this.getItem(id)) {
                    data.push(item)
                }
            })
    
            return data
        } catch (error) {
            console.error(error)
            return []
        }
    }

    static find(id = null) {
        if(!id) throw new Error('Please specify an identifier to find a row')

        try {
            let getItem = this.getItem(id)
    
            this.checkItemData(getItem, id)
    
            return new this(getItem)
        } catch (error) {
            return null
        }
    }

    static findOrFail(id = null) {
        let data = null

        if(data = this.find(id)) {
            return data
        }

        throw new Error(`Item with identifier ${id} not found on table ${this.table()}`)
    }

    update(data = {}) {
        if(!this.id) throw new Error('It is not possible to update an object that is not currently saved on database')

        this.fillFromData(data, true)

        let getItem = this.constructor.getItem(this.id)

        this.constructor.checkItemData(getItem, this.id)
        this.constructor.saveItem(this.id, this)

        return this
    }

    delete() {
        if(!this.id) throw new Error('It is not possible to delete an object that is not currently saved on database')

        let tableData = this.constructor.getTableData(),
            getItem = this.constructor.getItem(this.id)

        this.constructor.checkItemData(getItem, this.id)

        this.constructor.removeItem(this.id)

        tableData.count--
        delete tableData.index[this.id]
        this.constructor.saveTableData(tableData)

        this.clearData()

        return true
    }

    static checkItemData(getItem, id) {
        if(!getItem) {
            throw new Error(`Item with identifier ${id} not found on table ${this.table()}`)
        }

        return true
    }

    static primaryKey() {
        return 'id'
    }

    static table() {
        return pluralize(this.name).toLowerCase()
    }

    static tableKey() {
        return `reladb_database_${this.table()}`
    }

    static tableItemKey(id) {
        return `reladb_database_${this.table()}_item_${id}`
    }

    static getItem(id) {
        let itemKey = this.tableItemKey(id)

        if(!window.localStorage[itemKey]) return null

        return JSON.parse(window.localStorage[itemKey])
    }

    static saveItem(id, data) {
        let itemKey = this.tableItemKey(id)

        window.localStorage[itemKey] = JSON.stringify(data)
    }

    static removeItem(id, data) {
        let itemKey = this.tableItemKey(id)

        window.localStorage.removeItem(itemKey)
    }

    static getTableData() {
        let tableKey = this.tableKey()

        if(!window.localStorage[tableKey]) return this.tableStructure()

        return JSON.parse(window.localStorage[tableKey])
    }

    static saveTableData(data) {
        let tableKey = this.tableKey()

        window.localStorage[tableKey] = JSON.stringify(data)
    }

    static tableStructure() {
        return {
            count: 0,
            lastPrimaryKey: 0,
            index: {},
            additionalIndexes: {},
            items: [],
            relations: []
        }
    }

    static indexStructure() {
        return {
            hasMany: null,
            hasOne: null,
            belongsTo: null,
            belongsToMany: null,
        }
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