import Query from "../Query"

export default class BelongsTo {

    constructor(model) {
        this.model = model
    }
    
    setForeignKey(foreignKey) {
        if(!foreignKey) {
            foreignKey = `${this.model.name}Id`
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

    build() {
        console.log(this.foreignKey, this.ownerKey)
        return this
    }

    getQuery() {
        return new Query(this.model)
    }

    execute(item) {
        return {'test': 'asasdasd'}
    }

}