const Database = require('../../src/Database')
const { default: User } = require('../models/User')
const LocalStorage = require('../../src/Drivers/LocalStorage')

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

afterEach(() => {
    window.RelaDB.stopCaching()
    window.RelaDB.driver.clear() 
})

test('it gets empty data when a table does not exists on cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    window.RelaDB.cacheFrom(user)

    let cachedTables = window.RelaDB.cache.tables

    expect(window.RelaDB.isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => window.RelaDB.driver.setTable('others').getFromCache('something')).not.toThrow()
})

test('it can set data when a table does not exists on cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    window.RelaDB.cacheFrom(user)

    let cachedTables = window.RelaDB.cache.tables

    expect(window.RelaDB.isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => window.RelaDB.driver.setTable('others').setFromCache('foo', 'bar')).not.toThrow()
})

test('it can remove data when a table does not exists on cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})

    window.RelaDB.cacheFrom(user)

    let cachedTables = window.RelaDB.cache.tables

    expect(window.RelaDB.isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(() => window.RelaDB.driver.setTable('others').removeFromCache('foo', 'bar')).not.toThrow()
})