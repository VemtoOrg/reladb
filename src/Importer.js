const ImporterModel = require("./ImporterModel")

module.exports = class Importer {

    constructor(database) {
        this.database = database

        this.importedItems = []
    }

    fromData(data) {
        if(!data) return
        
        this.importData(data)
    }

    importData(data) {
        data.exportedItems.forEach(itemIdentifier => {

            let identifierSections = itemIdentifier.split(':'),
                table = identifierSections[0],
                itemId = identifierSections[1],
                itemData = data.tables[table][`item_${itemId}`]

            this.importItem(table, itemId, itemData)
        })
    }

    importItem(table, id, data) {

        let itemIdentifier = `${table}:${id}`

        if(this.importedItems.includes(itemIdentifier)) return

        let model = new ImporterModel(data)
        
        model.id = null
        model.constructor.table = () => table
        
        model.save()

        this.importedItems.push(itemIdentifier)

        console.log(this.importedItems)

    }

}