const { default: User } = require("./tests/models/User")

localStorage.clear()

async function insert() {
    for (let index = 0; index < 10000; index++) {
        User.create({name: 'Tiago', 'table': 'oiapoque'})
    }
}

// insert().then(() => {
//     // console.log(User.get())
// })