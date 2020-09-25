import Query from "../Query"

export default class BelongsTo {

    constructor(model) {
        this.model = model
    }
    
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

    getQuery() {
        return new Query(this.model)
    }

    execute(item) {
        if(!item[this.foreignKey]) return null
        return this.getQuery().findOrFail(item[this.foreignKey])
    }

}