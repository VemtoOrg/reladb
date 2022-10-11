import Photo from "../tests/models/Photo.js"
import Person from "../tests/models/Person.js"

import Resolver from "../src/Resolver.js"
import Database from "../src/Database.js"
import RAMStorage from "../src/Drivers/RAMStorage.js"
import FakeStorage from "../src/Drivers/FakeStorage.js"

let database = new Database

const testPerformance = (name, driver) => {
    database.setDriver(driver)

    console.log(`\x1b[33m%s\x1b[0m`, `Testing ${name} performance...`)

    Resolver.setDatabase(database)

    Resolver.db().driver.clear()

    global.countCalls = 0

    let t0 = performance.now()

    let person = Person.create({name: 'Tiago'})
    for (let index = 0; index < 1000; index++) {
        Photo.create({url: index + '.jpg', personId: person.id})
    }

    let t1 = performance.now()

    console.log(`\x1b[35m%s\x1b[0m`, `Total time to insert ${(t1 - t0).toFixed(2)} ms.`)

    t0 = performance.now()

    let photos = Person.find(person.id).photos

    t1 = performance.now()

    console.log('TOTAL PHOTOS: ' + photos.length)
    console.log(`\x1b[36m%s\x1b[0m`, `Total time to read ${(t1 - t0).toFixed(2)} ms.`)

    console.log('______________________________________________________________')
}

testPerformance('RAMStorage', RAMStorage)
testPerformance('FakeStorage', FakeStorage)