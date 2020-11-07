const moment = require('moment')
const Query = require('./Query')
const { version } = require('../package.json')

module.exports = class AsyncQuery extends Query {

    async count() {
        let tableData = await this.getTableData()
        return tableData.count
    }

    async create(data = {}) {
        if(window.RelaDB.events.creating) window.RelaDB.events.creating()

        let tableData = await this.getTableData(),
            id = ++tableData.lastPrimaryKey,
            item = null

        if(data[this.model.primaryKey()]) {
            delete data[this.model.primaryKey()]
        }

        this.blockFieldsReplacingRelationships(data)

        data[this.model.primaryKey()] = id
        
        this.saveItem(id, data)

        tableData.count++
        tableData.index[data.id] = this.indexStructure()
        
        this.saveTableData(tableData)

        item = new this.model(data)
        
        this.addIndexesByItem(item)

        if(window.RelaDB.events.creating) window.RelaDB.events.created()

        return item
    }

    get() {
        let data = [],
            filteredIndex = this.getFilteredIndex()

        this.log('Getting data from: ' + this.model.table())
        this.log('Current filtered index: ', filteredIndex)

        filteredIndex.forEach(id => {
            let item = null
            if(item = this.getItem(id)) {
                data.push(new this.model(item))
            }
        })
        
        this.clearFilteredIndex()

        this.log('Retrieved data:', data)

        return this.applyFilters(data)
    }

    async findAsync(id = null) {
        if(!id) throw new Error('Please specify an identifier to find a row')

        this.log(`Getting item ${id} from ${this.model.table()}`)

        try {
            let item = this.getItem(id)
    
            this.checkItemData(item, id)
    
            return item
        } catch (error) {
            this.log(`Item ${id} not found`)
            return null
        }
    }

    update(id, data = {}) {
        if(window.RelaDB.events.updating) window.RelaDB.events.updating()

        let oldItem = this.findOrFail(id)
        this.removeIndexesByItem(oldItem)

        this.blockFieldsReplacingRelationships(data)
        this.checkItemData(data, id)
        this.saveItem(id, data)

        let item = this.findOrFail(id)
        this.addIndexesByItem(item)

        oldItem = null

        if(window.RelaDB.events.updated) window.RelaDB.events.updated()

        return true
    }

    delete(id) {
        if(this.isAlreadyDeleting(id) || this.isAlreadyDeleted(id)) return

        this.addToDeletingBuffer(id)

        if(window.RelaDB.events.deleting) window.RelaDB.events.deleting()

        let item = this.getItem(id)
        
        if(!item) return

        this.checkForeignKeyConstraints(item)
        this.deleteChildrenByCascadeDelete(item)
        
        this.removeIndexesByItem(item)
        this.removeItem(id)

        let tableData = this.getTableData()
        tableData.count--
        delete tableData.index[id]
        this.saveTableData(tableData)

        if(window.RelaDB.events.deleted) window.RelaDB.events.deleted()

        this.removeFromDeletingBuffer(id)

        return true
    }

    isAlreadyDeleting(id) {
        return window.RelaDB.isAlreadyDeleting(this.tableKey(), id)
    }

    isAlreadyDeleted(id) {
        return !! !this.getItem(id)
    }
    
    addToDeletingBuffer(id) {
        return window.RelaDB.addToDeletingBuffer(this.tableKey(), id)
    }

    removeFromDeletingBuffer(id) {
        return window.RelaDB.removeFromDeletingBuffer(this.tableKey(), id)
    }

    blockFieldsReplacingRelationships(data) {
        let relationships = (new this.model).relationships()

        data = Object.assign({}, data)

        Object.keys(relationships).forEach(relationshipName => {
            if(typeof data[relationshipName] !== 'undefined') {
                throw new Error(`It is not possible to set the field ${relationshipName} because there is already a relationship with the same name`)
            }
        })
    }

    setFilters(filters) {
        this.filters = filters
        return this
    }

    applyFilters(data) {
        let orderFilters = this.filters.filter(filter => filter.type == 'order')

        orderFilters.forEach(filter => {
            data = data.sort(this.compare(filter.field, filter.direction))
        })

        return data
    }

    setFilteredIndex(filteredIndex) {
        this.filteredIndex = filteredIndex

        return this
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

        return this
    }

    getItem(id) {
        let itemKey = this.tableItemKey(id),
            itemData = this.dbDriver().get(itemKey)

        if(!itemData) return null

        return new this.model(itemData)
    }

    async getItemAsync(id) {
        let itemKey = this.tableItemKey(id),
            itemData = await this.dbDriver().getAsync(itemKey)

        if(!itemData) return null

        return new this.model(itemData)
    }

    saveItem(id, data) {
        let itemKey = this.tableItemKey(id)

        if(this.model.timestamps()) {
            if(!data.createdAt)
                data.createdAt = moment().format('YYYY-MM-DD HH:mm:ss')
            
            data.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss')
        }

        this.dbDriver().set(itemKey, data)
    }

    removeItem(id) {
        let itemKey = this.tableItemKey(id)

        this.dbDriver().remove(itemKey)
    }

    checkItemData(item, id) {
        if(!item) {
            throw new Error(`Item with identifier ${id} not found on table ${this.table()}`)
        }

        return true
    }

    async getTableData() {
        let tableKey = this.tableKey(),
            tableData = await this.dbDriver().getAsync(tableKey)

        if(!tableData) return this.tableStructure()

        return tableData
    }

    saveTableData(data) {
        let tableKey = this.tableKey()

        this.log(`Saving Data on table: ${tableKey}`, data)

        this.dbDriver().set(tableKey, data)

        return true
    }

    checkForeignKeyConstraints(item) {
        // It checks has one relations too, as HasOne extends HasMany
        let hasManyItemsCount = item.hasManyRelationships().reduce((acc, hasManyRelationship) => {
            if(hasManyRelationship.usesCascadeDelete) return acc
            return acc + hasManyRelationship.getAllItems(item).length   
        }, 0)

        if(hasManyItemsCount) throw new Error('Cannot delete a parent item: a foreign key constraint fails')
    }

    deleteChildrenByCascadeDelete(item) {
        // It deletes has one relations too, as HasOne extends HasMany
        item.hasManyRelationships().forEach(hasManyRelationship => {
            if(hasManyRelationship.usesCascadeDelete) {
                let children = hasManyRelationship.getAllItems(item)
                children.forEach(child => child.delete())
            }
        })
    }

    addIndexesByItem(item) {
        item.belongsToRelationships().forEach(
            belongsToRelationship => this.addItemToParentHasManyIndex(belongsToRelationship, item)
        )
    }

    removeIndexesByItem(item) {
        item.belongsToRelationships().forEach(
            belongsToRelationship => this.removeItemFromParentHasManyIndex(belongsToRelationship, item)
        )
    }

    addItemToParentHasManyIndex(relationship, item) {
        if(!item[relationship.foreignKey]) return
        
        this.log('Adding to parent has many: ' + relationship.signature())
        
        this.manipulateHasManyIndex(hasManyIndex => {
            if(relationship.allowsOnlyOne && hasManyIndex.length > 0) {
                throw new Error(`Has One relation doesn't allow more than one relation at same time | ${relationship.signature()}`)
            }

            hasManyIndex.push(item.id)
            hasManyIndex = [...new Set(hasManyIndex)]
            return hasManyIndex
        }, relationship, item)
    }

    removeItemFromParentHasManyIndex(relationship, item) {
        if(!item[relationship.foreignKey]) return
        
        this.log('Removing from parent has many: ' + relationship.signature())
        
        this.manipulateHasManyIndex(hasManyIndex => {
            hasManyIndex.splice(hasManyIndex.indexOf(item.id), 1)
            hasManyIndex = [...new Set(hasManyIndex)]
            return hasManyIndex
        }, relationship, item)
    }

    manipulateHasManyIndex(manipulationCallback, relationship, item) {
        let parent = relationship.getParentFromItem(item)
        
        if(!parent) return

        let parentQuery = parent.constructor.getQuery(),
            
            parentIndex = parentQuery.getItemIndex(parent),
            indexKey = `${item.getTable()}.${relationship.foreignKey}`,
            hasManyIndex = parentIndex.hasMany[indexKey] || []

        this.log(`Before manipulating has many index: ${indexKey} parent: ${parent.id} item: ${item.id}`, hasManyIndex)

        parentIndex.hasMany[indexKey] = manipulationCallback(hasManyIndex)

        this.log(`After manipulating has many index: ${indexKey} parent: ${parent.id} item: ${item.id}`, hasManyIndex)

        parentQuery.updateItemIndex(parent, parentIndex)
    }

    getItemHasManyIndex(item, relationship) {
        let itemIndex = item.constructor.getQuery().getItemIndex(item),
            indexKey = `${item.getTable()}.${relationship.foreignKey}`

        return itemIndex.hasMany[indexKey] || []
    }

    getItemIndex(item) {
        if(!item.id) return null

        let tableData = this.getTableData()
        
        return tableData.index[item.id] || null
    }

    updateItemIndex(item, newIndexData) {
        if(!item.id) return null

        let tableData = this.getTableData()
        
        tableData.index[item.id] = newIndexData

        return this.saveTableData(tableData)
    }

}