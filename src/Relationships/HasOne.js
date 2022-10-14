const HasMany = require('./HasMany.js')

module.exports = class HasOne extends HasMany {

    relationshipType() {
        return 'HasOne'
    }

    getAllItems(item) {
        return super.execute(item)
    }

    execute(item) {
        return super.execute(item)[0]
    }

    signature() {
        return `${this.localModel.identifier()}->HasMany(${this.model.identifier()}):${this.foreignKey},${this.localKey}`
    }

}