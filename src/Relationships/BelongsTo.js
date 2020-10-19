import Relationship from "./Relationship"

export default class BelongsTo extends Relationship {

    atMostOne() {
        this.allowsOnlyOne = true
        return this
    }

    setForeignKey(foreignKey) {
        if(!foreignKey) {
            foreignKey = `${this.model.identifier().toLowerCase()}Id`
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
        return this.getQuery().find(item[this.foreignKey])
    }

    execute(item) {
       return this.getParentFromItem(item) 
    }

    signature() {
        let type = this.allowsOnlyOne ? 'BelongsTo_One' : 'BelongsTo'
        return `${this.localModel.name}->${type}(${this.model.identifier()}):${this.foreignKey},${this.ownerKey}`
    }

}