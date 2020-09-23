import pluralize from 'pluralize'

export default class Model {

    constructor(data = {}) {

        this.initializeFromData(data)
    
    }

    initializeFromData(data = {}) {
        Object.keys(data).forEach(key => this[key] = data[key])
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
            positionByIndex = tableData.index[id],
            rowData = null

        if(positionByIndex === null || typeof positionByIndex === 'undefined') throw new Error(`Identifier ${id} doesn\'t found on ${this.table()} table index`)

        if(rowData = tableData.items[positionByIndex]) {
            return new this(rowData)
        }

        throw new Error(`Item with identifier ${id} not found on table ${this.table()}`)
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