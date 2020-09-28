const moment = require('moment')
const { default: User } = require("./models/User");

jest.useFakeTimers()

test('it allows to create data', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.id).toBe(1)
    expect(user.name).toBe('Tiago')
})

test('it adds created data to the table index', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jessica'})

    let tableData = User.getQuery().getTableData()

    expect(typeof tableData.index[user.id] != 'undefined').toBe(true)
    expect(typeof tableData.index[secondUser.id] != 'undefined').toBe(true)
})

test('it allows to find data', () => {
    localStorage.clear()

    User.create({name: 'Tiago', table: 'oiapoque'})

    let user = User.find(1)
    
    expect(user.name).toBe('Tiago')
    expect(user.table).toBe('oiapoque')
})

test('it can return empty data when trying to find nonexistent data', () => {
    localStorage.clear()

    expect(User.find(1)).toBe(null)  
})

test('it fails when trying to find nonexistent data', () => {
    localStorage.clear()

    expect(() => User.findOrFail(1))
        .toThrow('Item with identifier 1 not found on table users')  
})

test('it allows to update data', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'})

    expect(user.name).toBe('Tiago')

    user.update({name: 'Jonas'})

    user = User.find(1)

    expect(user.name).toBe('Jonas')
})

test('it does not allow to update the identifier', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'})

    user.update({id: 2})

    expect(user.id).toBe(1)
})

test('it allows to delete data', () => {
    localStorage.clear()

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
    localStorage.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})

    let users = User.get()

    expect(users[0].name).toBe('Tiago')
    expect(users[1].name).toBe('Jessica')
})

test('it adds the timestamps on create', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.createdAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
})

test('it updates timestamps on update', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'})

    setTimeout(() => {
        user.update({name: 'Jonas'})
    
        user = User.find(1)
    
        expect(user.updatedAt).toBe(moment().format('YYYY-MM-DD HH:mm:ss'))
    }, 5000);
})

test('it allows to count data', () => {
    localStorage.clear()

    User.create({name: 'Tiago'})
    User.create({name: 'Jessica'})
    User.create({name: 'Joao'})

    expect(User.count()).toBe(3)
})