const Database = require('../../src/Database')
const { default: Post } = require('../models/Post')
const { default: User } = require('../models/User')
const { default: Comment } = require('../models/Comment')
const LocalStorage = require('../../src/Drivers/LocalStorage')

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