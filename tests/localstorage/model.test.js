import Database from '../../src/Database.js'
import Resolver from '../../src/Resolver.js'
import LocalStorage from '../../src/Drivers/LocalStorage.js'

let database = new Database
database.setDriver(LocalStorage)

Resolver.setDatabase(database)

import '../imports/models-registry.js'

import '../model-tests'

afterAll(() => Resolver.db().driver.clear())