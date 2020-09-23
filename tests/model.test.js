const { default: User } = require("./models/User");

test('it allows to create data', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.name).toBe('Tiago')
})

test('it adds created data to the table index', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jessica'})

    let tableData = User.tableData()

    expect(tableData.index[user.id]).toBe(0)
    expect(tableData.index[secondUser.id]).toBe(1)
})

test('it allows to find data', () => {
    localStorage.clear()

    User.create({name: 'Tiago', table: 'oiapoque'})

    let user = User.find(1)
    
    expect(user.name).toBe('Tiago')
    expect(user.table).toBe('oiapoque')
})

test('it fails when trying to find nonexistent data', () => {
    localStorage.clear()

    expect(() => User.find(1))
        .toThrow('Identifier 1 doesn\'t found on users table index')  
})

test('it allows to update data', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago', table: 'oiapoque'})

    expect(user.name).toBe('Tiago')

    // user.update({
    //     name: 'Jonas'
    // })

    // user = User.find(1)
    
    // expect(user.name).toBe('Jonas')
})