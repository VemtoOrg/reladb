const { default: LocalStorage } = require("./src/Drivers/LocalStorage")
const { default: User } = require("./tests/models/User")

window.RelaDBDriver = LocalStorage
window.RelaDBDriver.clear()

async function insert() {
    for (let index = 0; index < 10; index++) {
        User.create({name: 'Tiago', 'table': 'oiapoque'})
    }
}

insert().then(() => {
    // console.log(User.get())
})