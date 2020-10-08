const { default: LocalStorage } = require('../../src/Drivers/LocalStorage');

window.RelaDB = {}
window.RelaDB.driver = LocalStorage

require('../model-tests')

afterAll(() => window.RelaDB.driver.clear())