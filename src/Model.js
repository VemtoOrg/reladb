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

        console.log(tableData.index[id])

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

/**
 * Se fizer assim vai dar problema por que precisará carregar todo o banco em memória para localizar os itens de uma tabela
database: {
    users: {
        count: 1,
        index: {
            1: 0
        },
        items: [
            {
                id: 1,
                name: 'Teste'
            }
        ]
    }
}

Desse jeito um pouco melhor, pois carrega apenas a tabela na memória
database_users: {
    count: 1,
    index: {
        1: 0
    },
    items: [
        {
            id: 1,
            name: 'Teste'
        }
    ]
}

Esse seria o melhor cenário, mas parece que o navegador não aguenta a alta quantidade de dados
database_users_1: {
    id: 1,
    name: 'Teste'
}
 */