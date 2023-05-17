import Database from '../../src/Database.js'
import Resolver from '../../src/Resolver.js'
import FakeStorage from '../../src/Drivers/FakeStorage.js'

let database = new Database
database.setDriver(FakeStorage)

Resolver.setDatabase(database)

import '../imports/models-registry.js'

import '../relationship-tests'

afterAll(() => Resolver.db().driver.clear())