const moment = require('moment')
const { default: User } = require("./models/User")
const packageSettings = require('../package.json')

try {
    jest.useFakeTimers()
} catch (error) {
    console.log(error.message)
}

test('it allows to create data', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.id).toBe(1)
    expect(user.name).toBe('Tiago')
})

test('it allows to save data from a model instance', () => {
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

    let user = new User
    user.fill({'name': 'Tiago'})
    user.save()

    user = User.findOrFail(1)

    expect(user.name).toBe('Tiago')
})

test('it adds created data to the table index', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jessica'})

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[user.id] != 'undefined').toBe(true)
    expect(typeof tableData.index[secondUser.id] != 'undefined').toBe(true)
})

test('it allows to find data', () => {
    window.RelaDBDriver.clear()

    User.create({name: 'Tiago', table: 'oiapoque'})

    let user = User.find(1)
    
    expect(user.name).toBe('Tiago')
    expect(user.table).toBe('oiapoque')
})

test('it can return empty data when trying to find nonexistent data', () => {
    window.RelaDBDriver.clear()

    expect(User.find(1)).toBe(null)  
})

test('it fails when trying to find nonexistent data', () => {
    window.RelaDBDriver.clear()

    expect(() => User.findOrFail(1))
        .toThrow('Item with identifier 1 not found on table users')  
})

test('it allows to update data', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.name).toBe('Tiago')

    user.update({name: 'Jonas'})

    user = User.find(1)

    expect(user.name).toBe('Jonas')
})

test('it allows to data update itself', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.name).toBe('Tiago')

    user.name = 'Jonas'
    user.save()

    user = User.find(1)

    expect(user.name).toBe('Jonas')
})

test('it does not allow to update the identifier', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    user.update({id: 2})

    expect(user.id).toBe(1)
})

test('it allows to delete data', () => {
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})

    let users = User.get()

    expect(users[0].name).toBe('Tiago')
    expect(users[1].name).toBe('Jessica')
})

test('it adds the timestamps on create', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.createdAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
})

test('it updates timestamps on update', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    setTimeout(() => {
        user.update({name: 'Jonas'})
    
        user = User.find(1)
    
        expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    }, 5000);
})

test('it allows to count data', () => {
    window.RelaDBDriver.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})
    User.create({name: 'Joao'})

    expect(User.count()).toBe(3)
})

test('it saves version on table data', () => {
    window.RelaDBDriver.clear()

    let tableData = User.getQuery().getTableData()

    expect(tableData.reladbVersion).toBe(packageSettings.version)
})

test('it allows to call a method on model object', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.testMethod()).toBe('test')
})

test('it allows to manipulate data before saving using creating method', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    // email is being predefined using creating() event on Model definition
    expect(user.email).toBe('my@email.com')
})

test('it allows to execute code after saving using created method', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    // phone is being added using created() event on Model definition
    expect(user.phones[0].phone).toBe('99999-9999')
})