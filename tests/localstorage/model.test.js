const Database = require('../../src/Database')
const DatabaseResolver = require('../../src/DatabaseResolver')
const LocalStorage = require('../../src/Drivers/LocalStorage')

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

require('../model-tests')

afterAll(() => DatabaseResolver.resolve().driver.clear())