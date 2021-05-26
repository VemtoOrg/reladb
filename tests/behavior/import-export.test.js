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
    Comment.create({comment: 'Hey!', postId: firstUser.id})
    Document.create({code: 'XTRE-123', userId: firstUser.id})

    let exporter = window.RelaDB.exporter.from(firstUser),
        data = exporter.getData()

    let importer = window.RelaDB.importer

    importer.fromData(data)

    console.log(JSON.parse(JSON.stringify(window.localStorage)))

    // let importedUser = User.findOrFail(2)

    // expect(importedUser.name).toBe('Tiago')
})