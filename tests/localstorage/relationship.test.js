const Database = require('../../src/Database');
const LocalStorage = require('../../src/Drivers/LocalStorage');

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

require('../relationship-tests')

afterAll(() => window.RelaDB.driver.clear())