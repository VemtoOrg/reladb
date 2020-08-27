import pluralize from 'pluralize'

export default class Model {

    constructor(data = {}) {

        this.initializeFromData(data)
    
    }

    initializeFromData(data = {}) {
        Object.keys(data).forEach(key => this[key] = data[key])
    }

    static create(data = {}) {
        let tableData = Model.tableData()

        data[Model.primaryKey()] = ++tableData.lastPrimaryKey

        tableData.items.push(data)
        tableData.count++
        tableData.index[data.id] = tableData.items.indexOf(data)

        Model.saveTableData(tableData)

        // Needs to return a new instance
        return new this(data)
    }

    static primaryKey() {
        return 'id'
    }

    static table() {
        return pluralize(this.name).toLowerCase()
    }

    static tableKey() {
        return `reladb_database_${Model.table()}`
    }

    static tableData() {
        let tableKey = Model.tableKey()

        if(!window.localStorage[tableKey]) return Model.tableStructure()

        return JSON.parse(window.localStorage[tableKey])
    }

    static saveTableData(data) {
        let tableKey = Model.tableKey()

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