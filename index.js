const { default: User } = require("./src/User");

let user = User.create({name: 'Tiago'})

console.log(user)