import Database from '../../src/Database.js'
import Resolver from '../../src/Resolver.js'
import RAMStorage from '../../src/Drivers/RAMStorage.js'

let database = new Database
database.setDriver(RAMStorage)

Resolver.setDatabase(database)

import '../imports/models-registry.js'

import '../model-tests'

afterEach(() => {
    database.setDriver(RAMStorage)
    Resolver.db().stopCaching()
    Resolver.db().driver.clear() 
})
afterAll(() => Resolver.db().driver.clear())