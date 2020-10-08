const { default: Database } = require('../../src/Database');
const { default: LocalStorage } = require('../../src/Drivers/LocalStorage');

window.RelaDB = new Database
window.RelaDB.driver = LocalStorage

require('../model-tests')

afterAll(() => window.RelaDB.driver.clear())