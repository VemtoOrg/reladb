import Relationship from './Relationship.js'

export default class HasMany extends Relationship {
    
    relationshipType() {
        return 'HasMany'
    }

    setForeignKey(foreignKey) {
        if(!foreignKey) {
            foreignKey = `${this.localModel.defaultKeyIdentifier().toLowerCase()}Id`
        }

        this.foreignKey = foreignKey

        return this
    }

    setLocalKey(localKey) {
        if(!localKey) {
            localKey = this.model.primaryKey()
        }

        this.localKey = localKey

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

    getAllItems() {
        return this.execute()
    }

    execute() {
        const item = this.getItem()
        
        let itemIndex = item.constructor.getQuery().getItemIndex(item)

        if(!itemIndex) return []

        let indexKey = `${this.model.table()}.${this.foreignKey}`,
            hasManyIndex = itemIndex.hasMany[indexKey] || []
        
        return this.getQuery()
            .setFilters(this.filters)
            .setFilteredIndex(hasManyIndex)
            .get() || []
    }

    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`
    }

}