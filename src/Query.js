export default class Query {

    constructor(model) {
        this.model = model
        this.filteredIndex = null
    }

    create(data = {}) {
        let tableData = this.getTableData(),
            id = ++tableData.lastPrimaryKey

        data[this.model.primaryKey()] = id
        
        this.saveItem(id, data)

        tableData.count++
        tableData.index[data.id] = this.indexStructure()
        
        this.saveTableData(tableData)

        return new this.model(data)
    }

    get() {
        let data = []

        this.getFilteredIndex().forEach(id => {
            let item = null
            if(item = this.getItem(id)) {
                data.push(new this.model(item))
            }
        })
        
        this.clearFilteredIndex()

        return data
    }

    find(id = null) {
        if(!id) throw new Error('Please specify an identifier to find a row')

        try {
            let item = this.getItem(id)
    
            this.checkItemData(item, id)
    
            return new this.model(item)
        } catch (error) {
            return null
        }
    }

    findOrFail(id = null) {
        let data = null

        if(data = this.find(id)) {
            return data
        }

        throw new Error(`Item with identifier ${id} not found on table ${this.model.table()}`)
    }

    update(id, data = {}) {
        this.checkItemData(data, id)
        this.saveItem(id, data)

        return true
    }

    delete(id) {
        let tableData = this.getTableData(),
            item = this.getItem(id)

        this.checkItemData(item, id)

        this.removeItem(id)

        tableData.count--
        delete tableData.index[id]
        this.saveTableData(tableData)

        return true
    }

    getFilteredIndex() {
        let tableData = this.getTableData()

        if(!this.filteredIndex) {
            return Object.keys(tableData.index)
        }

        return this.filteredIndex
    }

    clearFilteredIndex() {
        this.filteredIndex = null
    }

    getItem(id) {
        let itemKey = this.tableItemKey(id)

        if(!window.localStorage[itemKey]) return null

        return JSON.parse(window.localStorage[itemKey])
    }

    saveItem(id, data) {
        let itemKey = this.tableItemKey(id)

        window.localStorage[itemKey] = JSON.stringify(data)
    }

    removeItem(id) {
        let itemKey = this.tableItemKey(id)

        window.localStorage.removeItem(itemKey)
    }

    checkItemData(item, id) {
        if(!item) {
            throw new Error(`Item with identifier ${id} not found on table ${this.table()}`)
        }

        return true
    }

    getTableData() {
        let tableKey = this.tableKey()

        if(!window.localStorage[tableKey]) return this.tableStructure()

        return JSON.parse(window.localStorage[tableKey])
    }

    saveTableData(data) {
        let tableKey = this.tableKey()

        window.localStorage[tableKey] = JSON.stringify(data)
    }

    tableKey() {
        return `reladb_database_${this.model.table()}`
    }

    tableItemKey(id) {
        return `reladb_database_${this.model.table()}_item_${id}`
    }

    tableStructure() {
        return {
            count: 0,
            lastPrimaryKey: 0,
            index: {},
            additionalIndexes: {},
            items: [],
            relations: []
        }
    }

    indexStructure() {
        return {
            hasMany: null,
            hasOne: null,
            belongsTo: null,
            belongsToMany: null,
        }
    }

}