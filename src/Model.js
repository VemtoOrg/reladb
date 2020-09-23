import pluralize from 'pluralize'

export default class Model {

    constructor(data = {}) {

        this.fillFromData(data)
    
    }

    fillFromData(data = {}, disablePrimaryKeyFill = false) {
        let keys = Object.keys(data)
        
        if(disablePrimaryKeyFill) {
            keys = keys.filter(key => key != this.primaryKey())
        }
            
        keys.forEach(key => this[key] = data[key])

        return this
    }

    static create(data = {}) {
        let tableData = this.tableData()

        data[this.primaryKey()] = ++tableData.lastPrimaryKey

        tableData.items.push(data)
        tableData.count++
        tableData.index[data.id] = tableData.items.indexOf(data)

        this.saveTableData(tableData)

        return new this(data)
    }

    static find(id = null) {
        if(!id) throw new Error('Please specify an identifier to find a row')

        try {
            let tableData = this.tableData(),
                indexPosition = tableData.index[id]
                
            this.checkIndexPosition(indexPosition, id)
            
            let rowData = tableData.items[indexPosition]
    
            this.checkRowData(rowData, id)
    
            return new this(rowData)
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

        this.fillFromData(data)

        let tableData = this.constructor.tableData(),
            indexPosition = tableData.index[this.id]
        
        this.constructor.checkIndexPosition(indexPosition, this.id)
            
        let rowData = tableData.items[indexPosition]

        this.constructor.checkRowData(rowData, this.id)

        tableData.items[indexPosition] = this

        this.constructor.saveTableData(tableData)

        return this
    }

    delete() {
        if(!this.id) throw new Error('It is not possible to update an object that is not currently saved on database')

        let tableData = this.constructor.tableData(),
            indexPosition = tableData.index[this.id]
        
        this.constructor.checkIndexPosition(indexPosition, this.id)
            
        let rowData = tableData.items[indexPosition]

        this.constructor.checkRowData(rowData, this.id)

        tableData.items.splice(indexPosition, 1)
        delete tableData.items[this.id]

        this.constructor.saveTableData(tableData)

        this.clearData()

        return true
    }

    static checkIndexPosition(indexPosition, id) {
        let improperIndex = indexPosition === null 
            || typeof indexPosition === 'undefined'

        if(improperIndex) {
            throw new Error(`Identifier ${id} doesn\'t found on ${this.table()} table index`)
        }  
        
        return true
    }

    static checkRowData(rowData, id) {
        if(!rowData) {
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

    static tableData() {
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
            items: []
        }
    }

    clearData() {
        Object.keys(this).forEach(key => {
            delete this[key]
        })
    }

}