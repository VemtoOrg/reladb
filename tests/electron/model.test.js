const { default: ElectronJsonStorage } = require('../../src/Drivers/ElectronJsonStorage');

window.RelaDBDriver = ElectronJsonStorage
window.RelaDBDriver.testingMode()

require('../model-tests')

afterAll(() => window.RelaDBDriver.clear())