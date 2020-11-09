const Database = require('../../src/Database');
const ElectronJsonStorage = require('../../src/Drivers/ElectronJsonStorage');

window.RelaDB = new Database
window.RelaDB.setDriver(ElectronJsonStorage)
window.RelaDB.driver.testingMode()

require('../model-tests')

afterAll(() => window.RelaDB.driver.clear())