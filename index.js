const moment = require('moment')
const { default: LocalStorage } = require("./src/Drivers/LocalStorage")
const { default: Post } = require('./tests/models/Post')
const { default: User } = require("./tests/models/User")

window.RelaDB = {}
window.RelaDB.driver = LocalStorage
window.RelaDB.driver.clear()

async function insert() {
    for (let index = 0; index < 10; index++) {
        let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
        Post.create({name: 'Post', ownerId: user.id})
    }
}

const startTime = moment()

insert().then(() => {
    const endTime = moment()
    console.log(endTime.diff(startTime))
})