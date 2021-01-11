const { default: Post } = require("./models/Post");
const { default: User } = require("./models/User");
const { default: Comment } = require("./models/Comment");
const { default: Category } = require("./models/Category");
const { default: Document } = require("./models/Document");
const { default: Entity } = require("./models/Entity");
const { default: Field } = require("./models/Field");
const { default: Foreign } = require("./models/Foreign");
const { default: Project } = require("./models/Project");

test('it allows to get parent from belongs to relation', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        owner = post.owner
    
    expect(owner.id).toBe(user.id)
})

test('it does not allow to set a field with the same name as a relationship', () => {
    window.RelaDB.driver.clear()

    expect(() => {
        User.create({name: 'Tiago', posts: []})
    }).toThrow('It is not possible to set the field posts because there is already a relationship with the same name')
})

test('it adds has many index to parent after creating child data', () => {
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

    Post.create({title: 'Test', ownerId: null})
    
    expect(Post.count()).toBe(1)
})

test('it does not allow to delete a parent if it has children data by default', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'})

    Post.create({title: 'Test', ownerId: user.id})

    expect(() => user.delete())
        .toThrow('Cannot delete a parent item: a foreign key constraint fails')
})

test('it allows to cascade delete children data', () => {
    window.RelaDB.driver.clear()

    let post = Post.create({title: 'Test'})
        
    Comment.create({body: 'First comment', postId: post.id})
    Comment.create({body: 'Second comment', postId: post.id})

    expect(Comment.count()).toBe(2)

    post.delete()

    expect(Comment.count()).toBe(0)
})

test('it allows to get data through multiple relationships', () => {
    window.RelaDB.driver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'First Post', ownerId: user.id})
        
    Comment.create({body: 'First Comment', postId: post.id})
    Comment.create({body: 'Second Comment', postId: post.id})

    expect(user.posts[0].comments[0].body).toBe('First Comment')
    expect(user.posts[0].comments[1].body).toBe('Second Comment')
})

test('it allows to get data through recursive relationships', () => {
    window.RelaDB.driver.clear()

    let parentCategory = Category.create({title: 'Parent Category'}),
    
        firstChild = Category.create({title: 'Child Category 01', parentId: parentCategory.id}),
        secondChild = Category.create({title: 'Child Category 02', parentId: parentCategory.id})

    expect(firstChild.parent.id).toBe(parentCategory.id)
    expect(secondChild.parent.id).toBe(parentCategory.id)

    expect(parentCategory.children[0].id).toBe(firstChild.id)
    expect(parentCategory.children[1].id).toBe(secondChild.id)
})

test('it does not allow to add multiple relations with hasOne rule', () => {
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

    let parentDocument = Document.create({code: 'XTRE-123'}),
        childDocument = Document.create({code: 'XTRE-785', parentId: parentDocument.id})
    
    expect(parentDocument.child.id).toBe(childDocument.id)
    expect(childDocument.parent.id).toBe(parentDocument.id)

    childDocument.delete()

    let tableData = Document.getQuery().getTableData()
    
    expect(tableData.index[parentDocument.id].hasMany['documents.parentId'].includes(childDocument.id)).toBe(false)
})

test('it removes all indexes correctly after removing complex relations', () => {
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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
    window.RelaDB.driver.clear()

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