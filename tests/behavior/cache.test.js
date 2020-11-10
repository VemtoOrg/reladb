const Database = require('../../src/Database')
const { default: Post } = require('../models/Post')
const { default: User } = require('../models/User')
const { default: Comment } = require('../models/Comment')
const LocalStorage = require('../../src/Drivers/LocalStorage')
const { default: Project } = require('../models/Project')
const { default: Entity } = require('../models/Entity')
const { default: Relationship } = require('../models/Relationship')
const { default: Field } = require('../models/Field')

window.RelaDB = new Database
window.RelaDB.setDriver(LocalStorage)

afterEach(() => {
    window.RelaDB.stopCaching()
    window.RelaDB.driver.clear() 
})

test('it caches an item and all relations', () => {
    window.RelaDB.driver.clear()

    for (let index = 0; index < 10; index++) {
        let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    }
    
    let firstUser = User.find(1)

    window.RelaDB.cacheFrom(firstUser)

    let cachedTables = window.RelaDB.cache.tables

    expect(window.RelaDB.isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.posts !== 'undefined').toBe(true)
    expect(typeof cachedTables.phones !== 'undefined').toBe(true)
    expect(typeof cachedTables.comments !== 'undefined').toBe(true)

    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(typeof cachedTables.users.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.posts.posts !== 'undefined').toBe(true)
    expect(typeof cachedTables.phones.phones !== 'undefined').toBe(true)
    expect(typeof cachedTables.comments.comments !== 'undefined').toBe(true)

    expect(typeof cachedTables.users.item_1 !== 'undefined').toBe(true)
    expect(typeof cachedTables.posts.item_1 !== 'undefined').toBe(true)
    expect(typeof cachedTables.phones.item_1 !== 'undefined').toBe(true)
    expect(typeof cachedTables.comments.item_1 !== 'undefined').toBe(true)
})

test('it can stop caching data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    window.RelaDB.cacheFrom(user)

    expect(window.RelaDB.isCaching()).toBe(true)

    expect(typeof window.RelaDB.cache.tables.users.item_1 !== 'undefined').toBe(true)

    window.RelaDB.stopCaching()

    expect(window.RelaDB.isCaching()).toBe(false)

    expect(typeof window.RelaDB.cache.tables.users === 'undefined').toBe(true)
})

test('it can save data on cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    window.RelaDB.cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(window.RelaDB.cache.tables.users.item_1.name).toBe('Oiapoque')
})

test('it can remove data from cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    window.RelaDB.cacheFrom(user)

    // Removing some non-cascade-delete relations
    user.posts.forEach(post => post.delete())
    user.photos.forEach(photo => photo.delete())

    user.delete()

    expect(typeof window.RelaDB.cache.tables.users.item_1 === 'undefined').toBe(true)
})

test('it generates executable commands when manipulating data on cache', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    window.RelaDB.cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(window.RelaDB.commands.length > 0).toBe(true)
})

test('it can execute a database command that stores data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    window.RelaDB.cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.name = 'Oiapoque'
    user.save()

    window.RelaDB.stopCaching()

    expect(window.RelaDB.commands[0].command === 'set item_1 on users').toBe(true)

    // Execute the command to transfer the data from cache to the database storage
    window.RelaDB.commands[0].execute()

    // Now gets the data from the database storage
    user = User.find(user.id)

    expect(user.name).toBe('Oiapoque')

    // Check if the command was removed from the commands list
    expect(window.RelaDB.commands[0].command === 'set item_1 on users').toBe(false)
})

test('it can execute a database command that removes data', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        userId = user.id
    
    window.RelaDB.cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.delete()

    window.RelaDB.stopCaching()

    window.RelaDB.commands.forEach(command => command.execute())

    // Now gets the data from the database storage
    user = User.find(userId)

    expect(user).toBe(null)
})

test('it blocks wrong commands', () => {
    window.RelaDB.driver.clear()

    
    let command0 = window.RelaDB.dispatchCommand('something'),
        command1 = window.RelaDB.dispatchCommand('settt something on something'),
        command2 = window.RelaDB.dispatchCommand('set item_1 on phones', {})

    expect(() => command0.parseCommand()).toThrow()
    expect(() => command1.parseCommand()).toThrow()
    expect(() => command2.parseCommand()).not.toThrow()
})

test('it fires an event after dispatching a command', () => {
    window.RelaDB.driver.clear()

    let commands = []

    window.RelaDB.onDispatchCommand = command => commands.push(command)

    let command0 = window.RelaDB.dispatchCommand('something'),
        command1 = window.RelaDB.dispatchCommand('other')

    expect(commands[0].command).toBe(command0.command)
    expect(commands[1].command).toBe(command1.command)
})

test('it can cache items with recursive relations', () => {
    window.RelaDB.driver.clear()

    let project = Project.create({name: 'My Project'}),
        userEntity = Entity.create({name: 'User', projectId: project.id})

    Field.create({name: 'field2', order: 'c', entityId: userEntity.id})

    let firstRelationship = Relationship.create(
            {name: 'test', entityId: userEntity.id}
        ),
        secondRelationship = Relationship.create(
            {name: 'test', entityId: userEntity.id, inverseId: firstRelationship.id}
        )

    firstRelationship.inverseId = secondRelationship.id
    firstRelationship.save()

    window.RelaDB.cacheFrom(project)
})