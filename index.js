const { default: User } = require("./src/User");

let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
console.log(user)

console.log(User.find(1))
console.log(User.find(1000))