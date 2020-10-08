const { default: LocalStorage } = require('../../src/Drivers/LocalStorage');

window.RelaDB = {}
window.RelaDB.driver = LocalStorage

require('../relationship-tests')

afterAll(() => window.RelaDB.driver.clear())