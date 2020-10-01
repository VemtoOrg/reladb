const moment = require('moment')
const { default: LocalStorage } = require("./src/Drivers/LocalStorage")
const { default: User } = require("./tests/models/User")

window.RelaDBDriver = LocalStorage
window.RelaDBDriver.clear()

async function insert() {
    for (let index = 0; index < 2000; index++) {
        User.create({name: 'Tiago', 'table': 'oiapoque'})
    }
}

const startTime = moment()

insert().then(() => {
    const endTime = moment()
    console.log(endTime.diff(startTime))
})