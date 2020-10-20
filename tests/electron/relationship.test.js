const Database = require('../../src/Database');
const ElectronJsonStorage = require('../../src/Drivers/ElectronJsonStorage');

window.RelaDB = new Database
window.RelaDB.driver = ElectronJsonStorage
window.RelaDB.driver.testingMode()

require('../relationship-tests')

afterAll(() => window.RelaDB.driver.clear())