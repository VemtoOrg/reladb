import Relationship from "./Relationship"

export default class BelongsTo extends Relationship {

    setForeignKey(foreignKey) {
        if(!foreignKey) {
            foreignKey = `${this.model.name.toLowerCase()}Id`
        }

        this.foreignKey = foreignKey

        return this
    }

    setOwnerKey(ownerKey) {
        if(!ownerKey) {
            ownerKey = this.model.primaryKey()
        }

        this.ownerKey = ownerKey

        return this
    }

    getParentFromItem(item) {
        if(!item[this.foreignKey]) return null
        return this.getQuery().findOrFail(item[this.foreignKey])
    }

    execute(item) {
       return this.getParentFromItem(item) 
    }

}