const Database = require('../../src/Database')
const { default: Post } = require('../models/Post')
const { default: User } = require('../models/User')
const { default: Field } = require('../models/Field')
const { default: Entity } = require('../models/Entity')
const { default: Project } = require('../models/Project')
const { default: Comment } = require('../models/Comment')
const { default: Category } = require('../models/Category')
const LocalStorage = require('../../src/Drivers/LocalStorage')
const { default: Relationship } = require('../models/Relationship')
const DatabaseResolver = require('../../src/DatabaseResolver')

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

afterEach(() => {
    DatabaseResolver.resolve().stopCaching()
    DatabaseResolver.resolve().driver.clear() 
})

test('it caches an item and all relations', () => {
    DatabaseResolver.resolve().driver.clear()

    for (let index = 0; index < 10; index++) {
        let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    }
    
    let firstUser = User.find(1)

    DatabaseResolver.resolve().cacheFrom(firstUser)

    let cachedTables = DatabaseResolver.resolve().cache.tables,
        cachedItems = DatabaseResolver.resolve().cache.cachedItems,
        cachedRelationships = DatabaseResolver.resolve().cache.cachedRelationships

    expect(cachedItems[0]).toBe('users:1')
    expect(cachedRelationships[0]).toBe('User:1:photos')
    expect(cachedRelationships[1]).toBe('User:1:posts')
    expect(cachedRelationships[2]).toBe('Post:1:comments')
    expect(cachedRelationships[3]).toBe('User:1:document')
    expect(cachedRelationships[4]).toBe('User:1:phones')

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

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

test('it avoids caching an item twice', () => {
    DatabaseResolver.resolve().driver.clear()


    let firstUser = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Post.create({name: 'Post', ownerId: firstUser.id}),
    Comment.create({comment: 'Hey!', postId: firstUser.id})

    DatabaseResolver.resolve().cacheFrom(firstUser)

    let cachedItems = DatabaseResolver.resolve().cache.cachedItems,
        cachedRelationships = DatabaseResolver.resolve().cache.cachedRelationships

    expect(cachedItems.length).toBe(1)
    expect(cachedItems[0]).toBe('users:1')
    expect(cachedRelationships.length).toBe(5)
    expect(cachedRelationships[0]).toBe('User:1:photos')

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    DatabaseResolver.resolve().cacheFrom(firstUser)
    
    expect(cachedItems.length).toBe(1)
    expect(cachedRelationships.length).toBe(5)
})


test('it caches table data not related with the item', () => {
    DatabaseResolver.resolve().driver.clear()


    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
        post = Post.create({name: 'Post', ownerId: user.id}),
        comment = Comment.create({comment: 'Hey!', postId: post.id})

    // This data is not related with the user, but the table data (not items)
    // needs to be cached to avoid problems with primary keys and
    // table count. For example, if this table is not cached, then if
    // I create a category on cached context, the primary key will be 1,
    // instead of the latest primary key + 1 (in this case, 2). Notice
    // that only the table relevant information will be cached, never the
    // table items, as it is not necessary in thos cache context
    Category.create({category: 'test'})
    Entity.create({name: 'test entity'})

    DatabaseResolver.resolve().cacheFrom(user)

    let cachedTables = DatabaseResolver.resolve().cache.tables

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    expect(typeof cachedTables.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.posts !== 'undefined').toBe(true)
    expect(typeof cachedTables.phones !== 'undefined').toBe(true)
    expect(typeof cachedTables.comments !== 'undefined').toBe(true)
    expect(typeof cachedTables.categories !== 'undefined').toBe(true)
    expect(typeof cachedTables.entities !== 'undefined').toBe(true)

    expect(typeof cachedTables.others === 'undefined').toBe(true)

    expect(typeof cachedTables.users.users !== 'undefined').toBe(true)
    expect(typeof cachedTables.posts.posts !== 'undefined').toBe(true)
    expect(typeof cachedTables.phones.phones !== 'undefined').toBe(true)
    expect(typeof cachedTables.comments.comments !== 'undefined').toBe(true)
    expect(typeof cachedTables.categories.categories !== 'undefined').toBe(true)
    expect(typeof cachedTables.entities.entities !== 'undefined').toBe(true)

    expect(cachedTables.users.users.lastPrimaryKey).toBe(1)
    expect(cachedTables.categories.categories.lastPrimaryKey).toBe(1)
    expect(cachedTables.entities.entities.lastPrimaryKey).toBe(1)
})

test('it can stop caching data', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    DatabaseResolver.resolve().cacheFrom(user)

    expect(DatabaseResolver.resolve().isCaching()).toBe(true)

    expect(typeof DatabaseResolver.resolve().cache.tables.users.item_1 !== 'undefined').toBe(true)

    DatabaseResolver.resolve().stopCaching()

    expect(DatabaseResolver.resolve().isCaching()).toBe(false)

    expect(typeof DatabaseResolver.resolve().cache.tables.users === 'undefined').toBe(true)
})

test('it can save data on cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    DatabaseResolver.resolve().cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(DatabaseResolver.resolve().cache.tables.users.item_1.name).toBe('Oiapoque')
})

test('it can remove data from cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    DatabaseResolver.resolve().cacheFrom(user)

    // Removing some non-cascade-delete relations
    user.posts.forEach(post => post.delete())
    user.photos.forEach(photo => photo.delete())

    user.delete()

    expect(typeof DatabaseResolver.resolve().cache.tables.users.item_1 === 'undefined').toBe(true)
})

test('it generates executable commands when manipulating data on cache', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    DatabaseResolver.resolve().cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(DatabaseResolver.resolve().commands.length > 0).toBe(true)
})

test('it can execute a database command that stores data', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    DatabaseResolver.resolve().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.name = 'Oiapoque'
    user.save()

    DatabaseResolver.resolve().stopCaching()

    expect(DatabaseResolver.resolve().commands[0].command === 'set item_1 on users').toBe(true)

    // Execute the command to transfer the data from cache to the database storage
    DatabaseResolver.resolve().commands[0].execute()

    // Now gets the data from the database storage
    user = User.find(user.id)

    expect(user.name).toBe('Oiapoque')

    // Check if the command was removed from the commands list
    expect(DatabaseResolver.resolve().commands[0].command === 'set item_1 on users').toBe(false)
})

test('it can execute a database command that removes data', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago'}),
        userId = user.id
    
    DatabaseResolver.resolve().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.delete()

    DatabaseResolver.resolve().stopCaching()

    DatabaseResolver.resolve().commands.forEach(command => command.execute())

    // Now gets the data from the database storage
    user = User.find(userId)

    expect(user).toBe(null)
})

test('it blocks wrong commands', () => {
    DatabaseResolver.resolve().driver.clear()

    
    let command0 = DatabaseResolver.resolve().dispatchCommand('something'),
        command1 = DatabaseResolver.resolve().dispatchCommand('settt something on something'),
        command2 = DatabaseResolver.resolve().dispatchCommand('set item_1 on phones', {})

    expect(() => command0.parseCommand()).toThrow()
    expect(() => command1.parseCommand()).toThrow()
    expect(() => command2.parseCommand()).not.toThrow()
})

test('it fires an event after dispatching a command', () => {
    DatabaseResolver.resolve().driver.clear()

    let commands = []

    DatabaseResolver.resolve().onDispatchCommand = command => commands.push(command)

    let command0 = DatabaseResolver.resolve().dispatchCommand('something'),
        command1 = DatabaseResolver.resolve().dispatchCommand('other')

    expect(commands[0].command).toBe(command0.command)
    expect(commands[1].command).toBe(command1.command)
})

test('it can cache items with recursive relations', () => {
    DatabaseResolver.resolve().driver.clear()

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

    expect(() => DatabaseResolver.resolve().cacheFrom(project)).not.toThrow()
})

test('it marks as not executing after finishing a command', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    DatabaseResolver.resolve().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.name = 'Oiapoque'
    user.save()

    DatabaseResolver.resolve().stopCaching()

    // Execute the command to transfer the data from cache to the database storage
    DatabaseResolver.resolve().markAsExecuting(DatabaseResolver.resolve().commands[0])
    
    expect(DatabaseResolver.resolve().isExecutingCommands()).toBe(true)

    DatabaseResolver.resolve().commands[0].execute()

    expect(DatabaseResolver.resolve().isExecutingCommands()).toBe(false)
})

test('it removes unnecessary commands', () => {
    DatabaseResolver.resolve().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
        post = Post.create({name: 'Post', ownerId: user.id})
    
    DatabaseResolver.resolve().cacheFrom(user)

    // Manipulate the data to generate some commands

    user.name = 'Oiapoque'
    user.save()

    post.name = 'Updated Post'
    post.save()

    user.name = 'Oiapoque Edited'
    user.save()

    post.name = 'Updated Post 2'
    post.save()

    post.name = 'Updated Post 3'
    post.save()

    DatabaseResolver.resolve().stopCaching()

    let commandsEditingUser = DatabaseResolver.resolve().commands.filter(
        command => command.command == 'set item_1 on users'
    )

    expect(commandsEditingUser.length).toBe(1)

    let commandsEditingPost = DatabaseResolver.resolve().commands.filter(
        command => command.command == 'set item_1 on posts'
    )

    expect(commandsEditingPost.length).toBe(1)
})