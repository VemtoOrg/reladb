import Relationship from "./Relationship"

export default class HasMany extends Relationship {
    
    setForeignKey(foreignKey) {
        if(!foreignKey) {
            foreignKey = `${this.localModel.name.toLowerCase()}Id`
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

    getAllItems(item) {
        return this.execute(item)
    }

    execute(item) {
        let itemIndex = item.constructor.getQuery().getItemIndex(item)

        if(!itemIndex) return []

        let indexKey = `${this.model.table()}.${this.foreignKey}`,
            hasManyIndex = itemIndex.hasMany[indexKey] || []
        
        return this.getQuery()
            .setFilters(this.filters)
            .setFilteredIndex(hasManyIndex)
            .get()
    }

    signature() {
        return `${this.localModel.name}->HasMany(${this.model.name}):${this.foreignKey},${this.localKey}`
    }

}