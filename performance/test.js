import Photo from "../tests/models/Photo.js"
import Person from "../tests/models/Person.js"

import Resolver from "../src/Resolver.js"
import Database from "../src/Database.js"
import FakeStorage from "../src/Drivers/FakeStorage.js"

let database = new Database
database.setDriver(FakeStorage)

Resolver.setDatabase(database)

Resolver.db().driver.clear()

global.countCalls = 0

const t0 = performance.now()

let person = Person.create({name: 'Tiago'})
for (let index = 0; index < 5000; index++) {
    Photo.create({url: index + '.jpg', personId: person.id})
}

const t1 = performance.now()

console.log(`\x1b[36m%s\x1b[0m`, `Total time ${(t1 - t0).toFixed(2)} ms.`)
console.log(`\x1b[36m%s\x1b[0m`, `Total calls ${global.countCalls}.`)