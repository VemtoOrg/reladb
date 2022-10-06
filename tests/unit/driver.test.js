const Database = require('../../src/Database')
const { default: User } = require('../models/User')
const LocalStorage = require('../../src/Drivers/LocalStorage')
const DatabaseResolver = require('../../src/DatabaseResolver')

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

afterEach(() => {
    DatabaseResolver.resolve().stopCaching()
    DatabaseResolver.resolve().driver.clear() 
})

test('it gets empty data when a table does not exists on cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    DatabaseResolver.resolve().cacheFrom(user)

    let cachedTables = DatabaseResolver.resolve().cache.tables

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => DatabaseResolver.resolve().driver.setTable('others').getFromCache('something')).not.toThrow()
})

test('it can set data when a table does not exists on cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    DatabaseResolver.resolve().cacheFrom(user)

    let cachedTables = DatabaseResolver.resolve().cache.tables

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => DatabaseResolver.resolve().driver.setTable('others').setFromCache('foo', 'bar')).not.toThrow()
})

test('it can remove data when a table does not exists on cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    DatabaseResolver.resolve().cacheFrom(user)

    let cachedTables = DatabaseResolver.resolve().cache.tables

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => DatabaseResolver.resolve().driver.setTable('others').removeFromCache('foo', 'bar')).not.toThrow()
})