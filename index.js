const moment = require('moment')
const Database  = require('./src/Database')
const { default: Post } = require('./tests/models/Post')
const { default: User } = require('./tests/models/User')
const LocalStorage = require("./src/Drivers/LocalStorage")

window.User = User

window.RelaDB = new Database
window.RelaDB.driver = LocalStorage
window.RelaDB.driver.clear()

function insert() {
    for (let index = 0; index < 10; index++) {
        let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
        Post.create({name: 'Post', ownerId: user.id})
    }
}

insert()

window.RelaDB.cacheFrom(User.find(1))
