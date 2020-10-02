const { default: Model } = require('./src/Model')
const { default: Query } = require('./src/Query')
const { default: HasMany } = require('./src/Relationships/HasMany')
const { default: BelongsTo } = require('./src/Relationships/BelongsTo')
const { default: LocalStorage } = require('./src/Drivers/LocalStorage')
const { default: Relationship } = require('./src/Relationships/Relationship')
const { default: ElectronJsonStorage } = require('./src/Drivers/ElectronJsonStorage')

module.exports = {
    Model,
    Query,
    HasMany,
    BelongsTo,
    LocalStorage,
    Relationship,
    ElectronJsonStorage,
}