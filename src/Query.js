import moment from 'moment'
import Resolver from './Resolver.js'
import packageSettings from '../package.json'

export default class Query {

    constructor(model) {
        if(!Resolver.db()) throw new Error('The database is undefined. Please define create a database and add to Resolver')

        this.model = model
        this.filteredIndex = null
        this.filters = []
    }

    count() {
        return this.getTableData().count
    }

    create(data = {}) {
        if(Resolver.db().events.creating) Resolver.db().events.creating()

        let tableData = this.getTableData(),
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
        
        // TODO: Fix this
        // Serious performance issue here
        this.saveTableData(tableData)

        item = new this.model(data)
        
        this.addIndexesByItem(item)

        if(Resolver.db().events.creating) Resolver.db().events.created()

        return item
    }

    get() {
        let data = [],
            filteredIndex = this.getFilteredIndex()

        this.log('Getting data from: ' + this.model.table())
        this.log('Current filtered index for query: ', filteredIndex)

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

    findLatest() {
        let tableData = this.getTableData(),
            primaryKeys = Object.keys(tableData.index),
            latestPrimaryKey = Math.max(...primaryKeys)

        return this.find(latestPrimaryKey)
    }

    find(id = null) {
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

    findOrFail(id = null) {
        let data = null

        if(data = this.find(id)) {
            return data
        }

        throw new Error(`Item with identifier ${id} not found on table ${this.model.table()}`)
    }

    update(id, data = {}) {
        if(Resolver.db().events.updating) Resolver.db().events.updating()

        let oldItem = this.findOrFail(id)
        this.removeIndexesByItem(oldItem)

        this.blockFieldsReplacingRelationships(data)
        this.checkItemData(data, id)
        this.saveItem(id, data)

        let item = this.findOrFail(id)
        this.addIndexesByItem(item)

        oldItem = null

        if(Resolver.db().events.updated) Resolver.db().events.updated()

        Resolver.db().executeOnUpdateCallbackForTable(this.tableKey(), item)

        return true
    }

    delete(id) {
        if(this.isAlreadyDeleting(id) || this.isAlreadyDeleted(id)) return

        this.addToDeletingBuffer(id)

        if(Resolver.db().events.deleting) Resolver.db().events.deleting()

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

        if(Resolver.db().events.deleted) Resolver.db().events.deleted()

        this.removeFromDeletingBuffer(id)

        return true
    }

    isAlreadyDeleting(id) {
        return Resolver.db().isAlreadyDeleting(this.tableKey(), id)
    }

    isAlreadyDeleted(id) {
        return !! !this.getItem(id)
    }
    
    addToDeletingBuffer(id) {
        return Resolver.db().addToDeletingBuffer(this.tableKey(), id)
    }

    removeFromDeletingBuffer(id) {
        return Resolver.db().removeFromDeletingBuffer(this.tableKey(), id)
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
        let itemData = this.getItemData(id)

        if(!itemData) return null

        return new this.model(itemData)
    }

    getItemData(id) {
        let itemKey = this.tableItemKey(id),
            itemData = this.dbDriver().get(itemKey)

        if(!itemData) return null

        return itemData
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
            throw new Error(`Item with identifier ${id} not found on table ${this.model.table()}`)
        }

        return true
    }

    getTableData() {
        let tableKey = this.tableKey(),
            tableData = this.dbDriver().get(tableKey)

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
        
        this.log('%c Adding to parent has many: ' + relationship.signature(), 'color: orange')
        
        this.manipulateHasManyIndex(hasManyIndex => {

            // If the item was already added to the hasMany Index
            if(hasManyIndex.find(itemPk => itemPk === item.id)) {
                return [...new Set(hasManyIndex)]
            }

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
            parentIndex = parentQuery.getItemIndex(parent)

        if(!parentIndex) return

        let indexKey = `${item.getTable()}.${relationship.foreignKey}`,
            hasManyIndex = parentIndex.hasMany[indexKey] || []

        this.log(`%c Before manipulating has many index: ${indexKey} parent: ${parent.id} item: ${item.id}`, 'color: red', hasManyIndex)

        parentIndex.hasMany[indexKey] = manipulationCallback(hasManyIndex)

        this.log(`%c After manipulating has many index: ${indexKey} parent: ${parent.id} item: ${item.id}`, 'color: blue', hasManyIndex)

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

    tableKey() {
        return this.model.table()
    }

    tableItemKey(id) {
        return `item_${id}`
    }

    tableStructure() {
        return {
            count: 0,
            lastPrimaryKey: 0,
            index: {},
            additionalIndexes: {},
            items: [],
            relations: [],
            reladbVersion: packageSettings.version,
        }
    }

    indexStructure() {
        return this.constructor.basicIndexStructure()
    }

    static basicIndexStructure() {
        return {
            hasMany: {},
        }
    }

    dbDriver() {
        return Resolver.db().driver.setTable(this.model.table())
    }

    compare(field, direction = 'asc') {
        return function(a, b) {
            if(typeof a[field] === 'undefined' || typeof b[field] === 'undefined') return 0

            const itemA = typeof a[field] === 'number' ? a[field] : a[field].toString().toUpperCase()
            const itemB = typeof b[field] === 'number' ? b[field] : b[field].toString().toUpperCase()
          
            let comparison = 0
            
            if (itemA > itemB) {
              comparison = 1
            } else if (itemA < itemB) {
              comparison = -1
            }
    
            return direction == 'asc' ? comparison : comparison * -1
        }
    }

    log() {
        if(Resolver.db().mode === 'development') {
            if(!this.lastLogTime) this.lastLogTime = moment()
            
            let difference = moment().diff(this.lastLogTime)

            console.log(...arguments)

            if(difference > 10) {
                console.log(`%cExecution time: ${difference} ms`, 'color: #e74c3c; font-style: italic;')
            } else if(difference > 5) {
                console.log(`%cExecution time: ${difference} ms`, 'color: #f39c12; font-style: italic;')
            } else {
                console.log(`%cExecution time: ${difference} ms`, 'color: #3498db; font-style: italic;')
            }

            this.lastLogTime = moment()
        }
    }

}