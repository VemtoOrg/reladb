import Photo from "../tests/models/Photo.js"
import Person from "../tests/models/Person.js"

import Resolver from "../src/Resolver.js"
Resolver.db().driver.clear()

const t0 = performance.now()

let person = Person.create({name: 'Tiago'})
Photo.create({url: 'a.jpg', personId: person.id})

const t1 = performance.now()

console.log(`Total time ${t1 - t0} milliseconds.`)