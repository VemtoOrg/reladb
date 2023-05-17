import Post from '../models/Post.js'
import User from '../models/User.js'
import Field from '../models/Field.js'
import Entity from '../models/Entity.js' 
import Project from '../models/Project.js'
import Comment from '../models/Comment.js'
import Database from '../../src/Database.js'
import Category from '../models/Category.js'
import Resolver from '../../src/Resolver.js'
import Relationship from '../models/Relationship.js'
import LocalStorage from '../../src/Drivers/LocalStorage.js'

let database = new Database
database.setDriver(LocalStorage)

Resolver.setDatabase(database)

import '../imports/models-registry.js'

afterEach(() => {
    Resolver.db().stopCaching()
    Resolver.db().driver.clear() 
})

test('it caches an item and all relations', () => {
    Resolver.db().driver.clear()

    for (let index = 0; index < 10; index++) {
        let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    }
    
    let firstUser = User.find(1)

    Resolver.db().cacheFrom(firstUser)

    let cachedTables = Resolver.db().cache.tables,
        cachedItems = Resolver.db().cache.cachedItems,
        cachedRelationships = Resolver.db().cache.cachedRelationships

    expect(cachedItems[0]).toBe('users:1')
    expect(cachedRelationships[0]).toBe('User:1:photos')
    expect(cachedRelationships[1]).toBe('User:1:posts')
    expect(cachedRelationships[2]).toBe('Post:1:comments')
    expect(cachedRelationships[3]).toBe('User:1:document')
    expect(cachedRelationships[4]).toBe('User:1:phones')

    expect(Resolver.db().isCaching()).toBe(true)

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
    Resolver.db().driver.clear()


    let firstUser = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Post.create({name: 'Post', ownerId: firstUser.id}),
    Comment.create({comment: 'Hey!', postId: firstUser.id})

    Resolver.db().cacheFrom(firstUser)

    let cachedItems = Resolver.db().cache.cachedItems,
        cachedRelationships = Resolver.db().cache.cachedRelationships

    expect(cachedItems.length).toBe(1)
    expect(cachedItems[0]).toBe('users:1')
    expect(cachedRelationships.length).toBe(5)
    expect(cachedRelationships[0]).toBe('User:1:photos')

    expect(Resolver.db().isCaching()).toBe(true)

    Resolver.db().cacheFrom(firstUser)
    
    expect(cachedItems.length).toBe(1)
    expect(cachedRelationships.length).toBe(5)
})


test('it caches table data not related with the item', () => {
    Resolver.db().driver.clear()


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

    Resolver.db().cacheFrom(user)

    let cachedTables = Resolver.db().cache.tables

    expect(Resolver.db().isCaching()).toBe(true)

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
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Resolver.db().cacheFrom(user)

    expect(Resolver.db().isCaching()).toBe(true)

    expect(typeof Resolver.db().cache.tables.users.item_1 !== 'undefined').toBe(true)

    Resolver.db().stopCaching()

    expect(Resolver.db().isCaching()).toBe(false)

    expect(typeof Resolver.db().cache.tables.users === 'undefined').toBe(true)
})

test('it can save data on cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    Resolver.db().cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(Resolver.db().cache.tables.users.item_1.name).toBe('Oiapoque')
})

test('it can remove data from cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
            post = Post.create({name: 'Post', ownerId: user.id}),
            comment = Comment.create({comment: 'Hey!', postId: post.id})
    
    Resolver.db().cacheFrom(user)

    // Removing some non-cascade-delete relations
    user.posts.forEach(post => post.delete())
    user.photos.forEach(photo => photo.delete())

    user.delete()

    expect(typeof Resolver.db().cache.tables.users.item_1 === 'undefined').toBe(true)
})

test('it generates executable commands when manipulating data on cache', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Resolver.db().cacheFrom(user)

    user.name = 'Oiapoque'
    user.save()

    expect(Resolver.db().commands.length > 0).toBe(true)
})

test('it can execute a database command that stores data', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Resolver.db().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.name = 'Oiapoque'
    user.save()

    Resolver.db().stopCaching()

    expect(Resolver.db().commands[0].command === 'set item_1 on users').toBe(true)

    // Execute the command to transfer the data from cache to the database storage
    Resolver.db().commands[0].execute()

    // Now gets the data from the database storage
    user = User.find(user.id)

    expect(user.name).toBe('Oiapoque')

    // Check if the command was removed from the commands list
    expect(Resolver.db().commands[0].command === 'set item_1 on users').toBe(false)
})

test('it can execute a database command that removes data', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        userId = user.id
    
    Resolver.db().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.delete()

    Resolver.db().stopCaching()

    Resolver.db().commands.forEach(command => command.execute())

    // Now gets the data from the database storage
    user = User.find(userId)

    expect(user).toBe(null)
})

test('it blocks wrong commands', () => {
    Resolver.db().driver.clear()

    
    let command0 = Resolver.db().dispatchCommand('something'),
        command1 = Resolver.db().dispatchCommand('settt something on something'),
        command2 = Resolver.db().dispatchCommand('set item_1 on phones', {})

    expect(() => command0.parseCommand()).toThrow()
    expect(() => command1.parseCommand()).toThrow()
    expect(() => command2.parseCommand()).not.toThrow()
})

test('it fires an event after dispatching a command', () => {
    Resolver.db().driver.clear()

    let commands = []

    Resolver.db().onDispatchCommand = command => commands.push(command)

    let command0 = Resolver.db().dispatchCommand('something'),
        command1 = Resolver.db().dispatchCommand('other')

    expect(commands[0].command).toBe(command0.command)
    expect(commands[1].command).toBe(command1.command)
})

test('it can cache items with recursive relations', () => {
    Resolver.db().driver.clear()

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

    expect(() => Resolver.db().cacheFrom(project)).not.toThrow()
})

test('it marks as not executing after finishing a command', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Resolver.db().cacheFrom(user)

    // Manipulates the data on the RAM cache storage
    user.name = 'Oiapoque'
    user.save()

    Resolver.db().stopCaching()

    // Execute the command to transfer the data from cache to the database storage
    Resolver.db().markAsExecuting(Resolver.db().commands[0])
    
    expect(Resolver.db().isExecutingCommands()).toBe(true)

    Resolver.db().commands[0].execute()

    expect(Resolver.db().isExecutingCommands()).toBe(false)
})

test('it removes unnecessary commands', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago', 'table': 'oiapoque'}),
        post = Post.create({name: 'Post', ownerId: user.id})
    
    Resolver.db().cacheFrom(user)

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

    Resolver.db().stopCaching()

    let commandsEditingUser = Resolver.db().commands.filter(
        command => command.command == 'set item_1 on users'
    )

    expect(commandsEditingUser.length).toBe(1)

    let commandsEditingPost = Resolver.db().commands.filter(
        command => command.command == 'set item_1 on posts'
    )

    expect(commandsEditingPost.length).toBe(1)
})