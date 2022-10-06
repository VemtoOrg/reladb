const Database = require('../../src/Database')
const Resolver = require('../../src/Resolver')
const LocalStorage = require('../../src/Drivers/LocalStorage')

let database = new Database
database.setDriver(LocalStorage)

Resolver.setDatabase(database)

require('../model-tests')

afterAll(() => Resolver.db().driver.clear())