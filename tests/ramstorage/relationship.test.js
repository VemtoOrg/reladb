import Database from '../../src/Database.js'
import Resolver from '../../src/Resolver.js'
import RAMStorage from '../../src/Drivers/RAMStorage.js'

let database = new Database
database.setDriver(RAMStorage)

Resolver.setDatabase(database)

import '../relationship-tests'

afterAll(() => Resolver.db().driver.clear())