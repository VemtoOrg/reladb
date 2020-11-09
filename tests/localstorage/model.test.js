const Database = require('../../src/Database');
const LocalStorage = require('../../src/Drivers/LocalStorage');

window.RelaDB = new Database
window.RelaDB.setDriver(LocalStorage)

require('../model-tests')

afterAll(() => window.RelaDB.driver.clear())