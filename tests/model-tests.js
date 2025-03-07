import moment from "moment"
import User from "./models/User.js"
import Photo from "./models/Photo.js"
import Order from "./models/Order.js"
import Person from "./models/Person.js"
import Category from "./models/Category.js"
import Resolver from "../src/Resolver.js"
import packageSettings from "../package.json"
import Document from "./models/Document.js"

try {
    jest.useFakeTimers()
} catch (error) {
    console.log(error.message)
}

test("it allows to create data", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", table: "oiapoque" })

    expect(user.id).toBe(1)
    expect(user.name).toBe("Tiago")
})

test("it allows to save data from a model instance", () => {
    Resolver.db().driver.clear()

    let user = new User()
    user.name = "Tiago"
    user.save()

    user = User.findOrFail(1)

    expect(user.name).toBe("Tiago")

    user.address = "25th Street, 4000"
    user.save()

    expect(user.fresh().address).toBe("25th Street, 4000")
})

test("it allows to fill data on a model instance before saving", () => {
    Resolver.db().driver.clear()

    let user = new User()
    user.fill({ name: "Tiago" })
    user.save()

    user = User.findOrFail(1)

    expect(user.name).toBe("Tiago")
})

test("it adds created data to the table index", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" }),
        secondUser = User.create({ name: "Jessica" })

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[user.id] != "undefined").toBe(true)
    expect(typeof tableData.index[secondUser.id] != "undefined").toBe(true)
})

test("it allows to find data", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Tiago", table: "oiapoque" })

    let user = User.find(1)

    expect(user.name).toBe("Tiago")
    expect(user.table).toBe("oiapoque")
})

test("it allows to find the latest added data", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Tiago", table: "oiapoque" })
    User.create({ name: "Jessica", table: "oiapoque" })
    User.create({ name: "Daniel", table: "oiapoque" })
    User.create({ name: "Lisa", table: "oiapoque" })

    let user = User.latest()

    expect(user.name).toBe("Lisa")
})

test("it can return empty data when trying to find nonexistent data", () => {
    Resolver.db().driver.clear()

    expect(User.find(1)).toBe(null)
})

test("it fails when trying to find nonexistent data", () => {
    Resolver.db().driver.clear()

    expect(() => User.findOrFail(1)).toThrow("Item with identifier 1 not found on table users")
})

test("it allows to update data", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    expect(user.name).toBe("Tiago")

    user.update({ name: "Jonas" })

    user = User.find(1)

    expect(user.name).toBe("Jonas")
})

test("it allows to data update itself", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    expect(user.name).toBe("Tiago")

    user.name = "Jonas"
    user.save()

    user = User.find(1)

    expect(user.name).toBe("Jonas")
})

test("it does not allow to update the identifier", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    user.update({ id: 2 })

    expect(user.id).toBe(1)
})

test("it allows to delete data", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" }),
        userId = user.id

    expect(user.name).toBe("Tiago")
    user.delete()

    user = User.find(1)

    expect(user).toBe(null)

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[userId] === "undefined").toBe(true)
})

test("it allows to get data", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Tiago" })
    User.create({ name: "Jessica" })

    let users = User.get()

    expect(users[0].name).toBe("Tiago")
    expect(users[1].name).toBe("Jessica")
})

test("it allows to get ordered data", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Jessica" })
    User.create({ name: "Tiago" })
    User.create({ name: "Andressa" })

    let users = User.orderBy("name").get()

    expect(users[0].name).toBe("Andressa")
    expect(users[1].name).toBe("Jessica")
    expect(users[2].name).toBe("Tiago")

    users = User.orderBy("name", "desc").get()

    expect(users[0].name).toBe("Tiago")
    expect(users[1].name).toBe("Jessica")
    expect(users[2].name).toBe("Andressa")
})

test("it adds the timestamps on create", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", table: "oiapoque" })

    expect(user.createdAt).toBe(moment().format("YYYY-MM-DD HH:mm:ss"))
    expect(user.updatedAt).toBe(moment().format("YYYY-MM-DD HH:mm:ss"))
})

test("it updates timestamps on update", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    setTimeout(() => {
        user.update({ name: "Jonas" })

        user = User.find(1)

        expect(user.updatedAt).toBe(moment().format("YYYY-MM-DD HH:mm:ss"))
    }, 5000)
})

test("it allows to count data", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Tiago" })
    User.create({ name: "Jessica" })
    User.create({ name: "Joao" })

    expect(User.count()).toBe(3)
})

test("it saves version on table data", () => {
    Resolver.db().driver.clear()

    let tableData = User.getQuery().getTableData()

    expect(tableData.reladbVersion).toBe(packageSettings.version)
})

test("it allows to call a method on model object", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    expect(user.testMethod()).toBe("test")
})

test("it allows to manipulate data before saving using creating method", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", table: "oiapoque" })

    // email is being predefined using creating() event on Model definition
    expect(user.email).toBe("my@email.com")
})

test("it allows to execute code after saving using created method", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", table: "oiapoque" })

    // phone is being added using created() event on Model definition
    expect(user.phones[0].phone).toBe("99999-9999")
})

test("it updates the instance data when using the created method", () => {
    Resolver.db().driver.clear()

    let order = new Order({ date: "2021-01-01" })
    order.save()

    // checks if the foo parameter is automatically set by the created method
    expect(order.foo).toBe("bar")
})

test("it allows to manipulate data before update using beforeUpdate method", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", role: "User", age: 30 })

    user.role = "Admin"
    user.save()

    expect(user.fresh().role).toBe("Admin Changed")
    expect(user.fresh().email).toBe("my_edited@email.com")
    expect(user.fresh().age).toBe(25)
})

test("it allows to manipulate data before update using updating method", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", role: "User" })
    user.role = "Admin"
    user.save()

    // email is being changed using updating() event on Model definition
    expect(user.fresh().role).toBe("Admin Changed")
    expect(user.fresh().email).toBe("my_edited@email.com")
})

test("it allows to execute code after update using updated method", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })
    user.name = "Jonas"
    user.save()

    // phone is being added using updated() event on Model definition
    expect(user.fresh().phones[1].phone).toBe("77777-7777")
})

test("it allows to execute code before deleting data", () => {
    Resolver.db().driver.clear()

    let person = Person.create({ name: "Tiago" })

    Photo.create({ url: "a.jpg", personId: person.id })

    expect(person.photos.length).toBe(1)

    expect(() => person.delete()).toThrow("Person 1 was deleted")

    expect(Photo.count()).toBe(0)
})

test("it allows to execute code after deleting data", () => {
    Resolver.db().driver.clear()

    let person = Person.create({ name: "Tiago" })

    expect(() => person.delete()).toThrow("Person 1 was deleted")
})

test("it allows to hear database global events", () => {
    Resolver.db().driver.clear()

    let eventsCount = 0

    Resolver.db().events.creating = () => eventsCount++
    Resolver.db().events.created = () => eventsCount++
    Resolver.db().events.updating = () => eventsCount++
    Resolver.db().events.updated = () => eventsCount++
    Resolver.db().events.deleting = () => eventsCount++
    Resolver.db().events.deleted = () => eventsCount++

    let user = User.create({ name: "Tiago" })
    user.name = "Jonas"
    user.save()
    user.delete()

    expect(eventsCount).toBe(14)
})

/**
 * The deleting buffer is used to prevent calling .delete() in the same item, due
 * to relationships that can relate to the same entity. If something is in the
 * deleting buffer, calling .delete on it will simple return, avoiding a Max Stack
 * Call Exceeded Error
 */
test("it saves data being deleted on a buffer to avoid recursive deletion", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" }),
        iterations = []

    // Saving all deleting buffer iterations to check its steps
    Resolver.db().registerDeletingBufferListener((buffer) => iterations.push(buffer))

    user.delete()

    user = User.find(1)

    // { users: { '1': true } }
    expect(iterations[0].users[1]).toBe(true)

    // { users: { '1': true }, phones: { '1': true } }
    expect(iterations[1].users[1]).toBe(true)
    expect(iterations[1].phones[1]).toBe(true)

    // { users: { '1': true }, phones: {} }
    expect(iterations[2].users[1]).toBe(true)
    expect(!!iterations[2].phones[1]).toBe(false)

    // { users: {}, phones: {} }
    expect(!!iterations[3].users[1]).toBe(false)
    expect(!!iterations[3].phones[1]).toBe(false)
})

test("it can gets all tables names", () => {
    Resolver.db().driver.clear()

    User.create({ name: "Tiago", table: "oiapoque" })
    Category.create({ name: "testt" })

    let tables = Resolver.db().driver.getAllTableNames()

    expect(tables.includes("users")).toStrictEqual(true)
    expect(tables.includes("phones")).toStrictEqual(true)
    expect(tables.includes("categories")).toStrictEqual(true)
    expect(tables.includes("others")).toStrictEqual(false)
    expect(tables.includes("wrolds")).toStrictEqual(false)
})

test("it allows to disable saving data to storage", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    expect(user.fresh().name).toBe("Tiago")

    user.disableSavingData()

    user.name = "Tiago Edited"
    user.save()

    expect(user.fresh().name).toBe("Tiago")

    user.enableSavingData()

    user.name = "Tiago Edited"
    user.save()

    expect(user.fresh().name).toBe("Tiago Edited")
})

test("it allows to globally disable saving data to storage", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    expect(user.fresh().name).toBe("Tiago")

    Resolver.db().disableSavingData()

    user.name = "Tiago Edited"
    user.save()

    expect(user.fresh().name).toBe("Tiago")

    Resolver.db().enableSavingData()

    user.name = "Tiago Edited"
    user.save()

    expect(user.fresh().name).toBe("Tiago Edited")
})

test("it allows to listen to a model update", () => {
    Resolver.db().driver.clear()

    let updatedName = ""

    let user = User.create({ name: "Tiago" })

    user.onUpdateListener((user) => {
        updatedName = user.name
    })

    user.name = "Tiago Edited"
    user.save()

    expect(updatedName).toBe("Tiago Edited")
})

test("it allows to listen to table updates", () => {
    Resolver.db().driver.clear()

    let updatedName = ""

    let user = User.create({ name: "Tiago" })

    Resolver.db().onUpdateTable("users", (user) => {
        updatedName = user.name
    })

    user.name = "Tiago Edited"
    user.save()

    expect(updatedName).toBe("Tiago Edited")
})

test("it does not save model special data", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })

    let tableData = User.getQuery().getItemData(user.id)

    expect(tableData.__onUpdateListener).toBeUndefined()
    expect(tableData.__saveDataToStorage).toBeUndefined()
    expect(tableData.__returnRelationsAutomatically).toBeUndefined()

    user.name = "Tiago Edited"
    user.save()

    tableData = User.getQuery().getItemData(user.id)

    expect(tableData.__onUpdateListener).toBeUndefined()
    expect(tableData.__saveDataToStorage).toBeUndefined()
    expect(tableData.__returnRelationsAutomatically).toBeUndefined()

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)

    user.onUpdateListener(() => true)

    user.disableSavingData()
    user.disableAutomaticRelations()

    expect(user.__saveDataToStorage).toBe(false)
    expect(user.__onUpdateListener).not.toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(false)

    user.name = "Tiago Edited 2"
    user.save()

    expect(user.__saveDataToStorage).toBe(false)
    expect(user.__onUpdateListener).not.toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(false)

    user.enableSavingData()
    user.enableAutomaticRelations()
    user.onUpdateListener(null)

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)
})

test("it does not save special data for a post-saved model", () => {
    Resolver.db().driver.clear()

    let user = new User({ name: "Tiago" })

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)

    user.save()

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)

    let tableData = User.getQuery().getItemData(user.id)

    expect(tableData.__onUpdateListener).toBeUndefined()
    expect(tableData.__saveDataToStorage).toBeUndefined()
    expect(tableData.__returnRelationsAutomatically).toBeUndefined()

    user.name = "Tiago Edited"
    user.save()

    tableData = User.getQuery().getItemData(user.id)

    expect(tableData.__onUpdateListener).toBeUndefined()
    expect(tableData.__saveDataToStorage).toBeUndefined()
    expect(tableData.__returnRelationsAutomatically).toBeUndefined()

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)

    user.onUpdateListener(() => true)

    user.disableSavingData()
    user.disableAutomaticRelations()

    expect(user.__saveDataToStorage).toBe(false)
    expect(user.__onUpdateListener).not.toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(false)

    user.name = "Tiago Edited 2"
    user.save()

    expect(user.__saveDataToStorage).toBe(false)
    expect(user.__onUpdateListener).not.toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(false)

    user.enableSavingData()
    user.enableAutomaticRelations()
    user.onUpdateListener(null)

    expect(user.__saveDataToStorage).toBe(true)
    expect(user.__onUpdateListener).toBeNull()
    expect(user.__returnRelationsAutomatically).toBe(true)
})

test("it gets null when a model does not exists", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" })
    user.delete()

    let tableData = User.getQuery().getItem(user.id)

    expect(tableData).toBeNull()
})

test("it can check if a model has unsaved data", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago", table: "oiapoque" })

    expect(user.id).toBe(1)
    expect(user.name).toBe("Tiago")

    expect(user.hasUnsavedData()).toBe(false)

    user.name = "Tiago Edited"

    expect(user.hasUnsavedData()).toBe(true)

    user.save()

    expect(user.hasUnsavedData()).toBe(false)
})

test("it can check if a model has unsaved data if the model is not saved", () => {
    Resolver.db().driver.clear()

    let user = new User({ name: "Tiago", table: "oiapoque" })

    expect(typeof user.id).toBe("undefined")
    expect(user.name).toBe("Tiago")

    expect(user.hasUnsavedData()).toBe(true)

    user.name = "Tiago Edited"

    expect(user.hasUnsavedData()).toBe(true)

    user.save()

    expect(user.hasUnsavedData()).toBe(false)
})

test("it does not lose data when an error occurs during index manipulation", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" }),
        document = Document.create({ code: "XTRE-123", userId: user.id }),
        document2 = null,
        errorOccurred = false

    expect(user.document.id).toBe(document.id)

    try {
        document2 = Document.create({ code: "XTRE-785", userId: user.id })
    } catch (error) {
        errorOccurred = true
    }

    expect(errorOccurred).toBe(true)
    expect(document2).toBe(null)

    let tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany["documents.userId"].includes(document.id)).toBe(true)
})

test("it can listen to a global event when data is updated", () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({ name: "Tiago" }),
        user2 = User.create({ name: "Jessica" })

    user.addListener("updated", () => {
        listenerOcurrences++
    })

    user2.addListener("updated", () => {
        listenerOcurrences++
    })

    // Edit only the first user
    user.name = "Tiago Edited"
    user.save()

    expect(listenerOcurrences).toBe(1)
})

test("it can listen to a global event when data is deleted", () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({ name: "Tiago" }),
        user2 = User.create({ name: "Jessica" })

    user.addListener("deleted", () => {
        listenerOcurrences++
    })

    user2.addListener("deleted", () => {
        listenerOcurrences++
    })

    // Delete only the first user
    user.delete()

    expect(listenerOcurrences).toBe(1)
})

test("it can remove an updated listener from a model instance", () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({ name: "Tiago" })

    let listener = () => {
        listenerOcurrences++
    }

    let listenerId = user.addListener("updated", listener)

    user.name = "Tiago Edited"
    user.save()

    expect(listenerOcurrences).toBe(1)

    user.removeListener(listenerId)

    user.name = "Tiago Edited 2"
    user.save()

    expect(listenerOcurrences).toBe(1)
})

test("it can remove a deleted listener from a model instance", () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({ name: "Tiago" })

    let listener = () => {
        listenerOcurrences++
    }

    let listenerId = user.addListener("deleted", listener)

    user.delete()

    expect(listenerOcurrences).toBe(1)

    user.removeListener(listenerId)

    user.delete()

    expect(listenerOcurrences).toBe(1)
})

test("it can clear listeners from a model instance", () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({ name: "Tiago" })

    user.addListener("updated", () => {
        listenerOcurrences++
    })

    user.addListener("deleted", () => {
        listenerOcurrences++
    })

    user.clearListeners()

    user.name = "Tiago Edited"
    user.save()

    user.delete()

    expect(listenerOcurrences).toBe(0)
})

test("it can refresh a model instance", () => {
    Resolver.db().driver.clear()

    let user = User.create({ name: "Tiago" }),
        sameUser = User.find(user.id)

    user.name = "Tiago Edited"
    user.save()

    sameUser.refresh()

    expect(sameUser.name).toBe("Tiago Edited")
})

// test('it reloads every model instance when implicity updates are enabled', () => {
//     Resolver.db().driver.clear()
//     // Resolver.db().enableImplicitUpdates()

//     const user = User.create({name: 'Tiago'}),
//         user2 = User.find(user.id)

//     user.name = 'Tiago Edited'
//     user.save()

//     expect(user2.name).toBe('Tiago Edited')
// })
