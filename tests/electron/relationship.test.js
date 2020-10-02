const { default: ElectronJsonStorage } = require('../../src/Drivers/ElectronJsonStorage');

window.RelaDBDriver = ElectronJsonStorage
window.RelaDBDriver.testingMode()

require('../relationship-tests')

afterAll(() => window.RelaDBDriver.clear())