const { default: LocalStorage } = require('../src/Drivers/LocalStorage');

window.RelaDBDriver = LocalStorage

require('./model-tests')

afterAll(() => window.RelaDBDriver.clear())