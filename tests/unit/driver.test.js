const Database = require('../../src/Database')
const { default: User } = require('../models/User')
const LocalStorage = require('../../src/Drivers/LocalStorage')
const Resolver = require('../../src/Resolver')

let database = new Database
database.setDriver(LocalStorage)

Resolver.setDatabase(database)

afterEach(() => {
    Resolver.db().stopCaching()
    Resolver.db().driver.clear() 
})

test('it gets empty data when a table does not exists on cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    Resolver.db().cacheFrom(user)

    let cachedTables = Resolver.db().cache.tables

    expect(Resolver.db().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => Resolver.db().driver.setTable('others').getFromCache('something')).not.toThrow()
})

test('it can set data when a table does not exists on cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    Resolver.db().cacheFrom(user)

    let cachedTables = Resolver.db().cache.tables

    expect(Resolver.db().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => Resolver.db().driver.setTable('others').setFromCache('foo', 'bar')).not.toThrow()
})

test('it can remove data when a table does not exists on cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    Resolver.db().cacheFrom(user)

    let cachedTables = Resolver.db().cache.tables

    expect(Resolver.db().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => Resolver.db().driver.setTable('others').removeFromCache('foo', 'bar')).not.toThrow()
})