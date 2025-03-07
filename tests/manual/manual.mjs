import User from "./models/User.mjs"
import Post from "./models/Post.mjs"
import Address from "./models/Address.mjs"
import AddressUser from "./models/AddressUser.mjs"

import Resolver from "../../dist/esm/src/Resolver.js"
import Database from "../../dist/esm/src/Database.js"

import RAMStorage from "../../dist/esm/src/Drivers/RAMStorage.js"

let database = new Database()
database.setDriver(RAMStorage)

console.log("set database")

Resolver.onDatabaseReady(() => {
    console.log("Database ready!")
    Resolver.db().registerModel(Post, "Post")
    Resolver.db().registerModel(User, "User")
    Resolver.db().registerModel(Address, "Address")
    Resolver.db().registerModel(AddressUser, "AddressUser")
})

Resolver.setDatabase(database)

// start tests

let user = null

Resolver.db().driver.clear()

user = User.create({ name: "Tiago" })

Post.create({ title: "Test", ownerId: user.id })

try {
    console.log(user.name)
    user.delete()
} catch (error) {
    console.log(error.message)
}

Resolver.db().driver.clear()

user = User.create({ name: "User1" })
let user2 = User.create({ name: "User2" })

let address1 = Address.create({ street: "Street1" }),
    address2 = Address.create({ street: "Street2" })

user.relation("addresses").attach(address1)
user.relation("addresses").attach(address2)

user2.relation("addresses").attach(address1)

console.log("Before user delete:", AddressUser.get().length)

console.log(user.name)
user.delete()

console.log("After user delete:", AddressUser.get().length)
