import Relationship from './Relationship.js'

export default class BelongsToMany extends Relationship {
    
    relationshipType() {
        return 'BelongsToMany'
    }

    setPivotModel(pivotModel) {
        this.pivotModel = pivotModel

        return this
    }

    setForeignPivotKey(foreignPivotKey) {
        if(!foreignPivotKey) {
            foreignPivotKey = `${this.localModel.defaultKeyIdentifier()}Id`
        }

        this.foreignPivotKey = foreignPivotKey

        return this
    }

    setRelatedPivotKey(relatedPivotKey) {
        if(!relatedPivotKey) {
            relatedPivotKey = `${this.model.defaultKeyIdentifier()}Id`
        }

        this.relatedPivotKey = relatedPivotKey

        return this
    }

    cascadeDetach() {
        this.usesCascadeDetach = true

        return this
    }

    orderBy(field, direction = 'asc') {
        this.setFilters([{
            field: field,
            type: 'order',
            direction: direction
        }])
        
        return this
    }

    getAllItems() {
        return this.execute()
    }

    execute() {
        const pivotItems = this.getPivotItems()
        
        let relatedItems = this.getQuery()
            .setFilters(this.filters)
            .setFilteredIndex(pivotItems.map(pivotItem => pivotItem[this.relatedPivotKey]))
            .get() || []

        return relatedItems
    }

    getPivotItems() {
        const item = this.getItem()

        let itemIndex = item.constructor.getQuery().getItemIndex(item)

        if(!itemIndex) return []

        let indexKey = `${this.pivotModel.table()}.${this.foreignPivotKey}`,
            hasManyIndex = itemIndex.hasMany[indexKey] || []

        return this.pivotModel.getQuery()
            .setFilteredIndex(hasManyIndex)
            .get() || []
    }

    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`
    }

    attachUnique(relatedItem, extraData = null) {
        if(this.has(relatedItem)) return false

        return this.attach(relatedItem, extraData)
    }

    attach(relatedItem, extraData = null) {
        const pivotItem = new (this.pivotModel)

        pivotItem[this.foreignPivotKey] = this.getItem()[this.localModel.primaryKey()]
        pivotItem[this.relatedPivotKey] = relatedItem[this.model.primaryKey()]

        if(extraData) {
            Object.keys(extraData).forEach(key => {
                pivotItem[key] = extraData[key]
            })
        }

        pivotItem.save()

        return pivotItem
    }

    detachAllOcurrences(relatedItem) {
        const pivotItems = this.getPivotItems()

        if(!pivotItems.length) return false

        return pivotItems.filter(pivotItem => pivotItem[this.relatedPivotKey] == relatedItem[this.model.primaryKey()])
            .map(pivotItem => pivotItem.delete())
    }

    detachAll() {
        const pivotItems = this.getPivotItems()

        if(!pivotItems.length) return false

        return pivotItems.map(pivotItem => pivotItem.delete())
    }

    detach(relatedItem) {
        const pivotItem = this.getPivotItem(relatedItem)

        if(!pivotItem) return false

        return pivotItem.delete()
    }

    has(relatedItem) {
        return !!this.getPivotItem(relatedItem)
    }

    getPivotItem(relatedItem) {
        const pivotItems = this.getPivotItems()

        return pivotItems.find(pivotItem => pivotItem[this.relatedPivotKey] == relatedItem[this.model.primaryKey()])
    }

}