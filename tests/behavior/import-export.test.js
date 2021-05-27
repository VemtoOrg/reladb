const Database = require('../../src/Database')
const { default: Post } = require('../models/Post')
const { default: User } = require('../models/User')
const { default: Comment } = require('../models/Comment')
const { default: Document } = require('../models/Document')
const LocalStorage = require('../../src/Drivers/LocalStorage')

window.RelaDB = new Database
window.RelaDB.setDriver(LocalStorage)

afterEach(() => {
    window.RelaDB.stopCaching()
    window.RelaDB.driver.clear()
})

test('it generates data for export', () => {
    window.RelaDB.driver.clear()

    let firstUser = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Post.create({name: 'Post', ownerId: firstUser.id}),
    Comment.create({comment: 'Hey!', postId: firstUser.id})
    Document.create({code: 'XTRE-123', userId: firstUser.id})

    let exporter = window.RelaDB.exporter.from(firstUser),
        data = exporter.getData()

    let exportedItems = data.exportedItems,
        exportedRelationships = data.exportedRelationships

    expect(exportedItems.length).toBe(1)
    expect(exportedItems[0]).toBe('users:1')
    
    expect(exportedRelationships.length).toBe(6)
    expect(exportedRelationships[0]).toBe('User:1:photos')
    expect(exportedRelationships[1]).toBe('User:1:posts')
    expect(exportedRelationships[2]).toBe('Post:1:comments')
    expect(exportedRelationships[3]).toBe('User:1:document')
    expect(exportedRelationships[4]).toBe('Document:1:child')
    expect(exportedRelationships[5]).toBe('User:1:phones')
})

test('it can import the exported data', () => {
    window.RelaDB.driver.clear()

    let firstUser = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Post.create({name: 'Post', ownerId: firstUser.id}),
    Document.create({code: 'XTRE-123', userId: firstUser.id})
    Comment.create({comment: 'Hey!', postId: firstUser.id, authorId: firstUser.id})

    let exporter = window.RelaDB.exporter.from(firstUser),
        data = exporter.getData()

    let importer = window.RelaDB.importer

    importer.fromData(data)

    let importedUser = User.findOrFail(2)

    expect(importedUser.name).toBe('Tiago')

    let importedPost = Post.findOrFail(2)

    expect(importedPost.name).toBe('Post')
    expect(importedPost.ownerId).toBe(2)

    expect(importedUser.posts.length).toBe(1)
    expect(importedUser.posts[0].id).toBe(2)
    expect(importedUser.posts[0].name).toBe('Post')
    expect(importedUser.posts[0].ownerId).toBe(importedUser.id)

    expect(importedUser.document.id).toBe(2)
    expect(importedUser.document.code).toBe('XTRE-123')

    expect(importedUser.posts[0].comments.length).toBe(1)
    expect(importedUser.posts[0].comments[0].id).toBe(2)
    expect(importedUser.posts[0].comments[0].postId).toBe(importedPost.id)

    expect(importedUser.posts[0].comments[0].authorId).toBe(importedUser.id)
})