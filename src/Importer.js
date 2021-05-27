const ImporterModel = require("./ImporterModel")
const Query = require("./Query")

module.exports = class Importer {

    constructor(database) {
        this.database = database

        this.setup()
    }

    setup() {
        this.importedItems = []
        this.importingData = null
        this.importedItemsMap = {}

        this.importerModel = null
    }

    fromData(data) {
        if(!data) return

        this.importingData = data
        
        this.importData()
    }

    importData() {
        this.importerModel = ImporterModel

        this.importingData.exportedItems.forEach(itemIdentifier => {
            let identifierSections = itemIdentifier.split(':'),
                table = identifierSections[0],
                id = identifierSections[1]

            this.importItem(id, table)
        })

        this.finish()
    }

    importItem(id, table) {
        let itemData = this.importingData.tables[table][`item_${id}`],
            itemIdentifier = `${table}:${id}`

        this.importerModel.table = () => table

        if(this.importedItems.includes(itemIdentifier)) {
            let importedItemId = this.importedItemsMap[itemIdentifier]
            return this.importerModel.findOrFail(importedItemId)
        }
        
        let importedItem = new this.importerModel(itemData)
        importedItem.id = null
        importedItem.save()

        this.importedItems.push(itemIdentifier)
        this.importedItemsMap[itemIdentifier] = importedItem.id

        this.importHasManyRelationshipsItems(id, table, importedItem)

        return importedItem.fresh()
    }

    importHasManyRelationshipsItems(originalItemId, originalItemTable, importedItem) {
        let originalTableData = this.importingData.tables[originalItemTable][originalItemTable]

        if(!originalTableData.index[originalItemId] || !originalTableData.index[originalItemId].hasMany) return

        Object.keys(originalTableData.index[originalItemId].hasMany).forEach(indexName => {
            let indexItems = originalTableData.index[originalItemId].hasMany[indexName],
                indexSections = indexName.split('.'),
                relationshipTable = indexSections[0],
                foreignName = indexSections[1]
            
            let tableData = this.getTableDataWithImportedItemIndex(originalItemTable, importedItem, indexName)

            indexItems.forEach(originalRelatedItemId => {
                let addedRelationshipItem = this.importItem(originalRelatedItemId, relationshipTable)

                // It is necessary to force the table name here, as we are using a 
                // dynamic Model to import the data
                this.importerModel.table = () => relationshipTable

                addedRelationshipItem[foreignName] = importedItem.id
                addedRelationshipItem.save()

                // Add the item to the parent index
                tableData.index[importedItem.id].hasMany[indexName].push(addedRelationshipItem.id)
                
                this.importerModel.table = () => originalItemTable

                new Query(this.importerModel).saveTableData(tableData)
            })

        })
    }

    getTableDataWithImportedItemIndex(originalItemTable, importedItem, indexName) {
        this.importerModel.table = () => originalItemTable

        let tableData = (new Query(this.importerModel)).getTableData()

        if(!tableData.index[importedItem.id]) {
            tableData.index[importedItem.id] = Query.basicIndexStructure()
        } 
        
        if(!tableData.index[importedItem.id].hasMany[indexName]) {
            tableData.index[importedItem.id].hasMany[indexName] = []
        }

        return tableData
    }

    finish() {
        this.setup()
    }

}