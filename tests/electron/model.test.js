const { default: Database } = require('../../src/Database');
const { default: ElectronJsonStorage } = require('../../src/Drivers/ElectronJsonStorage');

window.RelaDB = new Database
window.RelaDB.driver = ElectronJsonStorage
window.RelaDB.driver.testingMode()

require('../model-tests')

afterAll(() => window.RelaDB.driver.clear())