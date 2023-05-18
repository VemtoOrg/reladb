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

    cascadeDelete() {
        this.usesCascadeDelete = true

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

    getAllItems(item) {
        return this.execute(item)
    }

    execute(item) {
        const pivotItems = this.getPivotItems(item)
        
        let relatedItems = this.getQuery()
            .setFilters(this.filters)
            .setFilteredIndex(pivotItems.map(pivotItem => pivotItem[this.relatedPivotKey]))
            .get() || []

        return relatedItems
    }

    getPivotItems(item) {
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

    attach(item, relatedItem) {
        const pivotModel = new (this.pivotModel),
            pivotItem = pivotModel.newInstance()

        pivotItem[this.foreignPivotKey] = item[this.localKey]
        pivotItem[this.relatedPivotKey] = relatedItem[this.model.primaryKey()]

        return pivotItem.save()
    }

    detach(item, relatedItem) {
        const pivotItem = this.getPivotItem(item, relatedItem)

        if(!pivotItem) return false

        return pivotItem.delete()
    }

    getPivotItem(item, relatedItem) {
        const pivotItems = this.getPivotItems(item)

        return pivotItems.find(pivotItem => pivotItem[this.relatedPivotKey] == relatedItem[this.model.primaryKey()])
    }

}