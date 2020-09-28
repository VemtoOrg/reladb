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

    execute(item) {
        let itemIndex = item.constructor.getQuery().getItemIndex(item),
            indexKey = `${this.model.table()}.${this.foreignKey}`,
            hasManyIndex = itemIndex.hasMany[indexKey] || []

        return this.getQuery().setFilteredIndex(hasManyIndex).get()
    }

}