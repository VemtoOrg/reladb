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

        let tableData = this.tableData(),
            indexPosition = tableData.index[id]
            
        this.checkIndexPosition(indexPosition, id)
        
        let rowData = tableData.items[indexPosition]

        this.checkRowData(rowData, id)

        return new this(rowData)
    }

    update(data = {}) {
        if(!this.id) throw new Error('It is not possible to update an object that is not currently saved on database')

        this.fillFromData(data)

        let tableData = Model.tableData(),
            indexPosition = tableData.index[this.id]
            
        Model.checkIndexPosition(indexPosition, this.id)
            
        let rowData = tableData.items[indexPosition]

        Model.checkRowData(rowData, this.id)

        tableData.items[indexPosition] = this

        Model.saveTableData(tableData)

        return this
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
            items: []
        }
    }

}