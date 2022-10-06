const Database = require('../../src/Database')
const { default: Post } = require('../models/Post')
const { default: User } = require('../models/User')
const { default: Comment } = require('../models/Comment')
const { default: Document } = require('../models/Document')
const LocalStorage = require('../../src/Drivers/LocalStorage')
const { default: Project } = require('../models/Project')
const { default: Entity } = require('../models/Entity')
const { default: Field } = require('../models/Field')
const { default: Foreign } = require('../models/Foreign')
const { default: Relationship } = require('../models/Relationship')

let database = new Database
database.setDriver(LocalStorage)

DatabaseResolver.setDatabase(database)

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

test('it can import from json data', () => {
    window.RelaDB.driver.clear()

    let firstUser = User.create({name: 'Tiago', 'table': 'oiapoque'})
    
    Post.create({name: 'Post', ownerId: firstUser.id}),
    Document.create({code: 'XTRE-123', userId: firstUser.id})
    Comment.create({comment: 'Hey!', postId: firstUser.id, authorId: firstUser.id})

    let exporter = window.RelaDB.exporter.from(firstUser),
        data = exporter.toJson()

    let importer = window.RelaDB.importer

    importer.fromJson(data)

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

test('it can import complex data', () => {
    window.RelaDB.driver.clear()

    let project = Project.create({name: 'My Project'}),
        userEntity = Entity.create({name: 'User', projectId: project.id}),
        userIdField = Field.create({name: 'id', entityId: userEntity.id}),
        userLogFkField = Field.create({name: 'log_id', entityId: userEntity.id}),
        logEntity = Entity.create({name: 'Log', projectId: project.id}),
        logIdField = Field.create({name: 'id', entityId: logEntity.id}),
        foreign = Foreign.create({fieldId: userLogFkField.id, relatedFieldId: logIdField.id, relatedEntityId: logEntity.id})

    Relationship.create(
        {name: 'logRelation', entityId: logEntity.id}
    ),
    Relationship.create(
        {name: 'logSecondRelation', entityId: logEntity.id, inverseId: 1}
    ),
    Relationship.create(
        {name: 'logThirdRelation', entityId: logEntity.id}
    ),
    Relationship.create(
        {name: 'userRelation', entityId: userEntity.id}
    )

    let exporter = window.RelaDB.exporter.from(project),
        data = exporter.getData()

    let importer = window.RelaDB.importer

    importer.fromData(data)

    let importedProject = Project.find(2)

    expect(importedProject.entities.length).toBe(2)

    let importedForeign = Foreign.find(2)

    expect(importedForeign.field.name).toBe('log_id')
    expect(importedForeign.relatedField.name).toBe('id')
    expect(importedForeign.relatedEntity.name).toBe('Log')

    let importedUserEntity = Entity.find(3),
        importedLogEntity = Entity.find(4)

    expect(importedUserEntity.name).toBe('User')
    expect(importedUserEntity.relations[0].name).toBe('userRelation')
    expect(importedUserEntity.relations[0].entity.id).toBe(importedUserEntity.id)

    expect(importedLogEntity.name).toBe('Log')
    expect(importedLogEntity.relations[0].name).toBe('logRelation')
    expect(importedLogEntity.relations[0].entity.id).toBe(importedLogEntity.id)
    expect(importedLogEntity.relations[1].name).toBe('logSecondRelation')
    expect(importedLogEntity.relations[1].entity.id).toBe(importedLogEntity.id)
    expect(importedLogEntity.relations[2].name).toBe('logThirdRelation')
    expect(importedLogEntity.relations[2].entity.id).toBe(importedLogEntity.id)
})