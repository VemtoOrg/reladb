import Post from "./models/Post.js"
import User from "./models/User.js"
import Comment from "./models/Comment.js"
import Category from "./models/Category.js"
import Document from "./models/Document.js"
import Entity from "./models/Entity.js"
import Field from "./models/Field.js"
import Foreign from "./models/Foreign.js"
import Project from "./models/Project.js"
import Resolver from "../src/Resolver.js"
import Tag from "./models/Tag.js"

test('it allows to get parent from belongs to relation', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        owner = post.owner
    
    expect(owner.id).toBe(user.id)
})

test('it does not allow to set a field with the same name as a relationship', () => {
    Resolver.db().driver.clear()

    expect(() => {
        User.create({name: 'Tiago', posts: []})
    }).toThrow('It is not possible to set the field posts because there is already a relationship with the same name')
})

test('it adds has many index to parent after creating child data', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jessica'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        secondPost = Post.create({title: 'Test', ownerId: secondUser.id})

    let tableData = User.getQuery().getTableData()

    // The index is based on table name
    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(post.id)).toBe(true)
    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(secondPost.id)).toBe(false)

    expect(tableData.index[secondUser.id].hasMany['posts.ownerId'].includes(post.id)).toBe(false)
    expect(tableData.index[secondUser.id].hasMany['posts.ownerId'].includes(secondPost.id)).toBe(true)
})

test('it changes has many index when changing parent', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Joseh'}),
        post = Post.create({title: 'Test', ownerId: user.id})

    let tableData = User.getQuery().getTableData()

    expect(post.owner.id).toBe(user.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(post.id)).toBe(true)
    expect(!! tableData.index[secondUser.id].hasMany['posts.ownerId']).toBe(false)
    
    post.update({
        ownerId: secondUser.id
    })

    // Refresh table data
    tableData = User.getQuery().getTableData()

    expect(post.owner.id).toBe(secondUser.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(post.id)).toBe(false)
    expect(tableData.index[secondUser.id].hasMany['posts.ownerId'].includes(post.id)).toBe(true)
})

test('it removes has many index on parent after removing child data', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        postId = post.id

    let tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(postId)).toBe(true)

    post.delete()

    tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(postId)).toBe(false)
})

test('it allows to get children from has many relation', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Jonas'}),

        post = Post.create({title: 'Test', ownerId: user.id}),
        secondPost = Post.create({title: 'Test 2', ownerId: user.id}),
        thirdPost = Post.create({title: 'Test 3', ownerId: secondUser.id})

    expect(user.posts.length).toBe(2)
    expect(secondUser.posts.length).toBe(1)

    expect(user.posts[0].id).toBe(post.id)
    expect(user.posts[1].id).toBe(secondPost.id)

    expect(secondUser.posts[0].id).toBe(thirdPost.id)
})

test('it allows to get sorted children from has many relation', () => {
    Resolver.db().driver.clear()

    let post = Post.create({title: 'Test'})
        
    Comment.create({body: 'Comment 1', postId: post.id, order: 3})
    Comment.create({body: 'Comment 2', postId: post.id, order: 1})
    Comment.create({body: 'Comment 3', postId: post.id, order: 4})
    Comment.create({body: 'Comment 4', postId: post.id, order: 2})

    expect(post.comments[0].body).toBe('Comment 2')
    expect(post.comments[1].body).toBe('Comment 4')
    expect(post.comments[2].body).toBe('Comment 1')
    expect(post.comments[3].body).toBe('Comment 3')
})

test('it allows to adds data with nullable foreign key', () => {
    Resolver.db().driver.clear()

    Post.create({title: 'Test', ownerId: null})
    
    expect(Post.count()).toBe(1)
})

test('it does not allow to delete a parent if it has children data by default', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'})

    Post.create({title: 'Test', ownerId: user.id})

    expect(() => user.delete())
        .toThrow('Cannot delete a parent item: a foreign key constraint fails')
})

test('it allows to cascade delete children data', () => {
    Resolver.db().driver.clear()

    let post = Post.create({title: 'Test'})
        
    Comment.create({body: 'First comment', postId: post.id})
    Comment.create({body: 'Second comment', postId: post.id})

    expect(Comment.count()).toBe(2)

    post.delete()

    expect(Comment.count()).toBe(0)
})

test('it allows to get data through multiple relationships', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'First Post', ownerId: user.id})
        
    Comment.create({body: 'First Comment', postId: post.id})
    Comment.create({body: 'Second Comment', postId: post.id})

    expect(user.posts[0].comments[0].body).toBe('First Comment')
    expect(user.posts[0].comments[1].body).toBe('Second Comment')
})

test('it allows to get data through recursive relationships', () => {
    Resolver.db().driver.clear()

    let parentCategory = Category.create({title: 'Parent Category'}),
    
        firstChild = Category.create({title: 'Child Category 01', parentId: parentCategory.id}),
        secondChild = Category.create({title: 'Child Category 02', parentId: parentCategory.id})

    expect(firstChild.parent.id).toBe(parentCategory.id)
    expect(secondChild.parent.id).toBe(parentCategory.id)

    expect(parentCategory.children[0].id).toBe(firstChild.id)
    expect(parentCategory.children[1].id).toBe(secondChild.id)
})

test('it does not allow to add multiple relations with hasOne rule', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        document = Document.create({code: 'XTRE-123', userId: user.id})
    
    expect(user.document.id).toBe(document.id)

    expect(() => {
        Document.create({code: 'XTRE-785', userId: user.id})
    }).toThrow('Has One relation doesn\'t allow more than one relation at same time')

    let tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['documents.userId'].includes(document.id)).toBe(true)
})

test('it allows to add another relation after deleting previous with hasOne rule', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        document = Document.create({code: 'XTRE-123', userId: user.id})
    
    expect(user.document.id).toBe(document.id)

    user.document.delete()

    let newDocument = Document.create({code: 'XTRE-785', userId: user.id})

    expect(user.document.id).toBe(newDocument.id)

    let tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['documents.userId'].includes(document.id)).toBe(false)
    expect(tableData.index[user.id].hasMany['documents.userId'].includes(newDocument.id)).toBe(true)
})

test('it removes index correctly after deleting from recursive relationship', () => {
    Resolver.db().driver.clear()

    let parentDocument = Document.create({code: 'XTRE-123'}),
        childDocument = Document.create({code: 'XTRE-785', parentId: parentDocument.id})
    
    expect(parentDocument.child.id).toBe(childDocument.id)
    expect(childDocument.parent.id).toBe(parentDocument.id)

    childDocument.delete()

    let tableData = Document.getQuery().getTableData()
    
    expect(tableData.index[parentDocument.id].hasMany['documents.parentId'].includes(childDocument.id)).toBe(false)
})

test('it removes all indexes correctly after removing complex relations', () => {
    Resolver.db().driver.clear()

    let project = Project.create({name: 'My Project'}),
        userEntity = Entity.create({name: 'User', projectId: project.id}),
        userIdField = Field.create({name: 'id', entityId: userEntity.id}),
        userLogFkField = Field.create({name: 'log_id', entityId: userEntity.id}),
        logEntity = Entity.create({name: 'Log', projectId: project.id}),
        logIdField = Field.create({name: 'id', entityId: logEntity.id}),
        foreign = Foreign.create({fieldId: userLogFkField.id, relatedFieldId: logIdField.id, relatedEntityId: logEntity.id})

    expect(foreign.field.id).toBe(userLogFkField.id)
    expect(foreign.relatedField.id).toBe(logIdField.id)
    expect(foreign.relatedEntity.id).toBe(logEntity.id)
    
    let fieldsTableData = Field.getQuery().getTableData()
    
    expect(fieldsTableData.index[userLogFkField.id].hasMany['foreigns.fieldId'].includes(foreign.id)).toBe(true)
    expect(fieldsTableData.index[logIdField.id].hasMany['foreigns.relatedFieldId'].includes(foreign.id)).toBe(true)

    logEntity.delete()

    fieldsTableData = Field.getQuery().getTableData()

    expect(fieldsTableData.index[userLogFkField.id].hasMany['foreigns.fieldId'].includes(foreign.id)).toBe(false)
    expect(typeof fieldsTableData.index[logIdField.id] === 'undefined').toBe(true)
})

test('it orders a relation correctly by a numeric field', () => {
    Resolver.db().driver.clear()

    let project = Project.create({name: 'My Project'}),
        userEntity = Entity.create({name: 'User', projectId: project.id}),
        field0 = Field.create({name: 'field0', order: 0, entityId: userEntity.id}),
        field7 = Field.create({name: 'field7', order: 7, entityId: userEntity.id}),
        field1 = Field.create({name: 'field1', order: 1, entityId: userEntity.id}),
        field2 = Field.create({name: 'field2', order: 2, entityId: userEntity.id}),
        field4 = Field.create({name: 'field4', order: 4, entityId: userEntity.id}),
        field8 = Field.create({name: 'field8', order: 8, entityId: userEntity.id}),
        field5 = Field.create({name: 'field5', order: 5, entityId: userEntity.id}),
        field6 = Field.create({name: 'field6', order: 6, entityId: userEntity.id}),
        field9 = Field.create({name: 'field9', order: 9, entityId: userEntity.id}),
        field3 = Field.create({name: 'field3', order: 3, entityId: userEntity.id}),
        field10 = Field.create({name: 'field10', order: 10, entityId: userEntity.id}),
        field11 = Field.create({name: 'field11', order: 11, entityId: userEntity.id})

    let fields = userEntity.fresh().fields

    expect(fields[0].id).toBe(field0.id)
    expect(fields[1].id).toBe(field1.id)
    expect(fields[2].id).toBe(field2.id)
    expect(fields[3].id).toBe(field3.id)
    expect(fields[4].id).toBe(field4.id)
    expect(fields[5].id).toBe(field5.id)
    expect(fields[6].id).toBe(field6.id)
    expect(fields[7].id).toBe(field7.id)
    expect(fields[8].id).toBe(field8.id)
    expect(fields[9].id).toBe(field9.id)
    expect(fields[10].id).toBe(field10.id)
    expect(fields[11].id).toBe(field11.id)
})

test('it orders a relation correctly by an alphabetical field', () => {
    Resolver.db().driver.clear()

    let project = Project.create({name: 'My Project'}),
        userEntity = Entity.create({name: 'User', projectId: project.id}),
        field2 = Field.create({name: 'field2', order: 'c', entityId: userEntity.id}),
        field3 = Field.create({name: 'field3', order: 'd', entityId: userEntity.id}),
        field0 = Field.create({name: 'field0', order: 'a', entityId: userEntity.id}),
        field6 = Field.create({name: 'field6', order: 'g', entityId: userEntity.id}),
        field7 = Field.create({name: 'field7', order: 'h', entityId: userEntity.id}),
        field1 = Field.create({name: 'field1', order: 'b', entityId: userEntity.id}),
        field4 = Field.create({name: 'field4', order: 'e', entityId: userEntity.id}),
        field9 = Field.create({name: 'field9', order: 'j', entityId: userEntity.id}),
        field5 = Field.create({name: 'field5', order: 'f', entityId: userEntity.id}),
        field8 = Field.create({name: 'field8', order: 'i', entityId: userEntity.id}),
        field10 = Field.create({name: 'field10', order: 'k', entityId: userEntity.id}),
        field11 = Field.create({name: 'field11', order: 'l', entityId: userEntity.id})

    let fields = userEntity.fresh().fields

    expect(fields[0].id).toBe(field0.id)
    expect(fields[1].id).toBe(field1.id)
    expect(fields[2].id).toBe(field2.id)
    expect(fields[3].id).toBe(field3.id)
    expect(fields[4].id).toBe(field4.id)
    expect(fields[5].id).toBe(field5.id)
    expect(fields[6].id).toBe(field6.id)
    expect(fields[7].id).toBe(field7.id)
    expect(fields[8].id).toBe(field8.id)
    expect(fields[9].id).toBe(field9.id)
    expect(fields[10].id).toBe(field10.id)
    expect(fields[11].id).toBe(field11.id)
})

test('it allows to disable getting automatic relations', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id})
    
    expect(post.owner.id).toBe(user.id)

    post.disableAutomaticRelations()

    expect(typeof post.owner === 'undefined').toBe(true)

    post.owner = 'something'

    expect(post.owner).toBe('something')

    post.enableAutomaticRelations()

    expect(post.owner.id).toBe(user.id)
})

test('it fires a belongsTo relationship created event', () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let firstUser = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Tiago'})

    firstUser.addListener('posts:created', () => {
        listenerOcurrences++
    })

    secondUser.addListener('posts:created', () => {
        listenerOcurrences++
    })

    Post.create({title: 'Test', ownerId: secondUser.id})
    
    expect(listenerOcurrences).toBe(1)
})

test('it receives data from a belongsTo relationship created event', () => {
    Resolver.db().driver.clear()

    let createdPost = null

    let user = User.create({name: 'Tiago'})

    user.addListener('posts:created', post => {
        createdPost = post
    })

    Post.create({title: 'Test', ownerId: user.id})
    
    expect(createdPost.id).toBe(1)
    expect(createdPost.ownerId).toBe(user.id)
})

test('it fires a belongsTo relationship updated event', () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let firstUser = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: secondUser.id})

    firstUser.addListener('posts:updated', () => {
        listenerOcurrences++
    })

    secondUser.addListener('posts:updated', () => {
        listenerOcurrences++
    })

    post.title = 'Updated Title'
    post.save()
    
    expect(listenerOcurrences).toBe(1)
})

test('it receives data from a belongsTo relationship updated event', () => {
    Resolver.db().driver.clear()

    let updatedPostTitle = ''

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id})

    user.addListener('posts:updated', post => {
        updatedPostTitle = post.title
    })

    post.title = 'Updated Title'
    post.save()
    
    expect(updatedPostTitle).toBe('Updated Title')
})

test('it fires a belongsTo relationship deleted event', () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let firstUser = User.create({name: 'Tiago'}),
        secondUser = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: secondUser.id})

    firstUser.addListener('posts:deleted', () => {
        listenerOcurrences++
    })

    secondUser.addListener('posts:deleted', () => {
        listenerOcurrences++
    })

    post.delete()
    
    expect(listenerOcurrences).toBe(1)
})

test('it receives data from a belongsTo relationship deleted event', () => {
    Resolver.db().driver.clear()

    let deletedPostId = null

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id})

    user.addListener('posts:deleted', postId => {
        deletedPostId = postId
    })

    post.delete()
    
    expect(deletedPostId).toBe(1)
})

test('it can remove an event listener', () => {
    Resolver.db().driver.clear()

    let listenerOcurrences = 0

    let user = User.create({name: 'Tiago'})

    user.addListener('posts:created', () => {
        listenerOcurrences++
    })

    user.removeListener('posts:created', () => {
        listenerOcurrences++
    })

    Post.create({title: 'Test', ownerId: user.id})
    
    expect(listenerOcurrences).toBe(0)
})

test('it saves has many index ordered', () => {
    Resolver.db().driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test'}),
        secondPost = Post.create({title: 'Test'}),
        thirdPost = Post.create({title: 'Test'}),
        fourthPost = Post.create({title: 'Test'})

    let tableData = null

    thirdPost.ownerId = user.id
    thirdPost.save()

    tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].length).toBe(1)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][0]).toBe(thirdPost.id)

    secondPost.ownerId = user.id
    secondPost.save()

    tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].length).toBe(2)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][0]).toBe(secondPost.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][1]).toBe(thirdPost.id)

    fourthPost.ownerId = user.id
    fourthPost.save()

    tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].length).toBe(3)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][0]).toBe(secondPost.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][1]).toBe(thirdPost.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][2]).toBe(fourthPost.id)

    post.ownerId = user.id
    post.save()

    tableData = User.getQuery().getTableData()

    expect(tableData.index[user.id].hasMany['posts.ownerId'].length).toBe(4)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][0]).toBe(post.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][1]).toBe(secondPost.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][2]).toBe(thirdPost.id)
    expect(tableData.index[user.id].hasMany['posts.ownerId'][3]).toBe(fourthPost.id)
})

test('it allows to get children from morph many relation', () => {
    Resolver.db().driver.clear()

    let post1 = Post.create({title: 'First Post'}),
        post2 = Post.create({title: 'Second Post'}),
        post3 = Post.create({title: 'Third Post'})

    Tag.create({ name: 'Tag1', taggableId: post1.id, taggableType: 'Post'})
    Tag.create({ name: 'Tag2', taggableId: post1.id, taggableType: 'Post'})
    Tag.create({ name: 'Tag3', taggableId: post2.id, taggableType: 'Post'})

    expect(post1.tags.length).toBe(2)
    expect(post2.tags.length).toBe(1)
    expect(post3.tags.length).toBe(0)

    expect(post1.tags[0].name).toBe('Tag1')
    expect(post1.tags[1].name).toBe('Tag2')
    expect(post2.tags[0].name).toBe('Tag3')
})

test('it allows to get parent from morph to relation', () => {
    Resolver.db().driver.clear()

    let post = Post.create({title: 'Post'}),
        document = Document.create({title: 'Document'})

    let tag1 = Tag.create({ name: 'PostTag1', taggableId: post.id, taggableType: 'Post'}),
        tag2 = Tag.create({ name: 'PostTag2', taggableId: post.id, taggableType: 'Post'}),
        tag3 = Tag.create({ name: 'DocumentTag1', taggableId: document.id, taggableType: 'Document'}),
        tag4 = Tag.create({ name: 'DocumentTag2', taggableId: document.id, taggableType: 'Document'})

    expect(post.tags.length).toBe(2)
    expect(document.tags.length).toBe(2)

    expect(tag1.taggable.title).toBe('Post')
    expect(tag2.taggable.title).toBe('Post')
    expect(tag3.taggable.title).toBe('Document')
    expect(tag4.taggable.title).toBe('Document')
})

test('it allows to cascade delete morph many children data', () => {
    Resolver.db().driver.clear()

    let post = Post.create({title: 'Post'})
        
    Tag.create({ name: 'Tag1', taggableId: post.id, taggableType: 'Post'})
    Tag.create({ name: 'Tag2', taggableId: post.id, taggableType: 'Post'})

    expect(Tag.count()).toBe(2)

    post.delete()

    expect(Tag.count()).toBe(0)
})