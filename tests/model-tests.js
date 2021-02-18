const moment = require('moment')
const { default: User } = require("./models/User")
const packageSettings = require('../package.json')
const { default: Photo } = require("./models/Photo")
const { default: Order } = require("./models/Order")
const { default: Person } = require('./models/Person')
const { default: Category } = require("./models/Category")

try {
    jest.useFakeTimers()
} catch (error) {
    console.log(error.message)
}

test('it allows to create data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.id).toBe(1)
    expect(user.name).toBe('Tiago')
})

test('it allows to save data from a model instance', () => {
    window.RelaDB.driver.clear()

    let user = new User
    user.name = 'Tiago'
    user.save()

    user = User.findOrFail(1)

    expect(user.name).toBe('Tiago')

    user.address = '25th Street, 4000'
    user.save()

    expect(user.fresh().address).toBe('25th Street, 4000')
})

test('it allows to fill data on a model instance before saving', () => {
    window.RelaDB.driver.clear()

    let user = new User
    user.fill({'name': 'Tiago'})
    user.save()

    user = User.findOrFail(1)

    expect(user.name).toBe('Tiago')
})

test('it adds created data to the table index', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jessica'})

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[user.id] != 'undefined').toBe(true)
    expect(typeof tableData.index[secondUser.id] != 'undefined').toBe(true)
})

test('it allows to find data', () => {
    window.RelaDB.driver.clear()

    User.create({name: 'Tiago', table: 'oiapoque'})

    let user = User.find(1)
    
    expect(user.name).toBe('Tiago')
    expect(user.table).toBe('oiapoque')
})

test('it can return empty data when trying to find nonexistent data', () => {
    window.RelaDB.driver.clear()

    expect(User.find(1)).toBe(null)  
})

test('it fails when trying to find nonexistent data', () => {
    window.RelaDB.driver.clear()

    expect(() => User.findOrFail(1))
        .toThrow('Item with identifier 1 not found on table users')  
})

test('it allows to update data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.name).toBe('Tiago')

    user.update({name: 'Jonas'})

    user = User.find(1)

    expect(user.name).toBe('Jonas')
})

test('it allows to data update itself', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.name).toBe('Tiago')

    user.name = 'Jonas'
    user.save()

    user = User.find(1)

    expect(user.name).toBe('Jonas')
})

test('it does not allow to update the identifier', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    user.update({id: 2})

    expect(user.id).toBe(1)
})

test('it allows to delete data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        userId = user.id

    expect(user.name).toBe('Tiago')
    user.delete()

    user = User.find(1)

    expect(user).toBe(null)

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[userId] === 'undefined').toBe(true)
})

test('it allows to get data', () => {
    window.RelaDB.driver.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})

    let users = User.get()

    expect(users[0].name).toBe('Tiago')
    expect(users[1].name).toBe('Jessica')
})

test('it allows to get ordered data', () => {
    window.RelaDB.driver.clear()

    User.create({name: 'Jessica'})
    User.create({name: 'Tiago'})
    User.create({name: 'Andressa'})

    let users = User.orderBy('name').get()

    expect(users[0].name).toBe('Andressa')
    expect(users[1].name).toBe('Jessica')
    expect(users[2].name).toBe('Tiago')

    users = User.orderBy('name', 'desc').get()

    expect(users[0].name).toBe('Tiago')
    expect(users[1].name).toBe('Jessica')
    expect(users[2].name).toBe('Andressa')
})

test('it adds the timestamps on create', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.createdAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
})

test('it updates timestamps on update', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    setTimeout(() => {
        user.update({name: 'Jonas'})
    
        user = User.find(1)
    
        expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    }, 5000);
})

test('it allows to count data', () => {
    window.RelaDB.driver.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})
    User.create({name: 'Joao'})

    expect(User.count()).toBe(3)
})

test('it saves version on table data', () => {
    window.RelaDB.driver.clear()

    let tableData = User.getQuery().getTableData()

    expect(tableData.reladbVersion).toBe(packageSettings.version)
})

test('it allows to call a method on model object', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.testMethod()).toBe('test')
})

test('it allows to manipulate data before saving using creating method', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    // email is being predefined using creating() event on Model definition
    expect(user.email).toBe('my@email.com')
})

test('it allows to execute code after saving using created method', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    // phone is being added using created() event on Model definition
    expect(user.phones[0].phone).toBe('99999-9999')
})

test('it updates the instance data when using the created method', () => {
    window.RelaDB.driver.clear()

    let order = new Order({date: '2021-01-01'})
    order.save()

    // checks if the foo parameter is automatically set by the created method
    expect(order.foo).toBe('bar')
})

test('it allows to manipulate data before update using updating method', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})
    user.name = 'Jonas'
    user.save()

    // email is being changed using updating() event on Model definition
    expect(user.fresh().email).toBe('my_edited@email.com')
})

test('it allows to execute code after update using updated method', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})
    user.name = 'Jonas'
    user.save()

    // phone is being added using updated() event on Model definition
    expect(user.fresh().phones[1].phone).toBe('77777-7777')
})

test('it allows to execute code before deleting data', () => {
    window.RelaDB.driver.clear()

    let person = Person.create({name: 'Tiago'})
    
    Photo.create({url: 'a.jpg', personId: person.id})

    expect(person.photos.length).toBe(1)

    expect(() => person.delete()).toThrow('Person 1 was deleted')

    expect(Photo.count()).toBe(0)
})

test('it allows to execute code after deleting data', () => {
    window.RelaDB.driver.clear()

    let person = Person.create({name: 'Tiago'})

    expect(() => person.delete()).toThrow('Person 1 was deleted')
})

test('it allows to hear database global events', () => {
    window.RelaDB.driver.clear()

    let eventsCount = 0

    window.RelaDB.events.creating = () => eventsCount++
    window.RelaDB.events.created = () => eventsCount++
    window.RelaDB.events.updating = () => eventsCount++
    window.RelaDB.events.updated = () => eventsCount++
    window.RelaDB.events.deleting = () => eventsCount++
    window.RelaDB.events.deleted = () => eventsCount++
    
    let user = User.create({name: 'Tiago'})
    user.name = 'Jonas'
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
test('it saves data being deleted on a buffer to avoid recursive deletion', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        iterations = []

    // Saving all deleting buffer iterations to check its steps
    window.RelaDB.registerDeletingBufferListener(
        (buffer) => iterations.push(buffer)
    )

    user.delete()

    user = User.find(1)

    // { users: { '1': true } }
    expect(iterations[0].users[1]).toBe(true)
    
    // { users: { '1': true }, phones: { '1': true } }
    expect(iterations[1].users[1]).toBe(true)
    expect(iterations[1].phones[1]).toBe(true)

    // { users: { '1': true }, phones: {} }
    expect(iterations[2].users[1]).toBe(true)
    expect(!! iterations[2].phones[1]).toBe(false)
    
    // { users: {}, phones: {} }
    expect(!! iterations[3].users[1]).toBe(false)
    expect(!! iterations[3].phones[1]).toBe(false)
})

test('it can gets all tables names', () => {
    window.RelaDB.driver.clear()

    User.create({name: 'Tiago', table: 'oiapoque'})
    Category.create({name: 'testt'})

    let tables = window.RelaDB.driver.getAllTableNames()

    expect(tables.includes('users')).toStrictEqual(true)
    expect(tables.includes('phones')).toStrictEqual(true)
    expect(tables.includes('categories')).toStrictEqual(true)
    expect(tables.includes('others')).toStrictEqual(false)
    expect(tables.includes('wrolds')).toStrictEqual(false)
})

test('it allows to disable saving data to storage', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})
    
    expect(user.fresh().name).toBe('Tiago')

    user.disableSavingData()

    user.name = 'Tiago Edited'
    user.save()

    expect(user.fresh().name).toBe('Tiago')

    user.enableSavingData()

    user.name = 'Tiago Edited'
    user.save()

    expect(user.fresh().name).toBe('Tiago Edited')
})