import Database from '../../src/Database.js'
import User from '../models/User.js'
import LocalStorage from '../../src/Drivers/LocalStorage.js'
import RAMStorage from '../../src/Drivers/RAMStorage.js'
import Resolver from '../../src/Resolver.js'

let database = new Database
database.setDriver(LocalStorage)

Resolver.setDatabase(database)

afterEach(() => {
    database.setDriver(LocalStorage)
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

test('it can fill all database data', () => {
    database.setDriver(RAMStorage)

    User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    expect(User.count()).toBe(1)

    let databaseData = Resolver.db().driver.getDatabaseData()

    if(Resolver.db().driver.allowsDataFeeding()) {
        User.create({name: 'Tiago', 'table': 'oiapoque'})
    
        expect(User.count()).toBe(2)

        Resolver.db().driver.feedDatabaseData(databaseData)

        expect(User.count()).toBe(1)
    }
})

test('it can execute a callback when database data is changed', () => {
    Resolver.db().driver.clear()

    let changed = false

    Resolver.db().onDataChanged(() => {
        changed = true
    })

    User.create({name: 'Tiago'})

    expect(changed).toBe(true)
})

test('it does not execute a changed callback when database data is get', () => {
    Resolver.db().driver.clear()

    User.create({name: 'Tiago'})

    let changed = false

    Resolver.db().onDataChanged(() => {
        changed = true
    })

    const user = User.find(1)

    expect(changed).toBe(false)
})