import Query from "../Query"

export default class HasMany {

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

    setLocalKey(localKey) {
        if(!localKey) {
            localKey = this.model.primaryKey()
        }

        this.localKey = localKey

        return this
    }

    build() {
        console.log(this.foreignKey, this.localKey)
        return this
    }

    getQuery() {
        return new Query(this.model)
    }

    execute(item) {
        return {'test': 'asasdasd'}
    }

}