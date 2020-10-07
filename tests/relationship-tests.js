const { default: Post } = require("./models/Post");
const { default: User } = require("./models/User");
const { default: Comment } = require("./models/Comment");
const { default: Category } = require("./models/Category");
const { default: Document } = require("./models/Document");

test('it allows to get parent from belongs to relation', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        owner = post.owner
    
    expect(owner.id).toBe(user.id)
})

test('it does not allow to set a field with the same name as a relationship', () => {
    window.RelaDBDriver.clear()

    expect(() => {
        User.create({name: 'Tiago', posts: []})
    }).toThrow('It is not possible to set posts because there is already a relationship with the same name')
})

test('it adds has many index to parent after creating child data', () => {
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

    Post.create({title: 'Test', ownerId: null})
    
    expect(Post.count()).toBe(1)
})

test('it does not allow to delete a parent if it has children data by default', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'})

    Post.create({title: 'Test', ownerId: user.id})

    expect(() => user.delete())
        .toThrow('Cannot delete a parent item: a foreign key constraint fails')
})

test('it allows to cascade delete children data', () => {
    window.RelaDBDriver.clear()

    let post = Post.create({title: 'Test'})
        
    Comment.create({body: 'First comment', postId: post.id})
    Comment.create({body: 'Second comment', postId: post.id})

    expect(Comment.count()).toBe(2)

    post.delete()

    expect(Comment.count()).toBe(0)
})

test('it allows to get data through multiple relationships', () => {
    window.RelaDBDriver.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'First Post', ownerId: user.id})
        
    Comment.create({body: 'First Comment', postId: post.id})
    Comment.create({body: 'Second Comment', postId: post.id})

    expect(user.posts[0].comments[0].body).toBe('First Comment')
    expect(user.posts[0].comments[1].body).toBe('Second Comment')
})

test('it allows to get data through recursive relationships', () => {
    window.RelaDBDriver.clear()

    let parentCategory = Category.create({title: 'Parent Category'}),
    
        firstChild = Category.create({title: 'Child Category 01', parentId: parentCategory.id}),
        secondChild = Category.create({title: 'Child Category 02', parentId: parentCategory.id})

    expect(firstChild.parent.id).toBe(parentCategory.id)
    expect(secondChild.parent.id).toBe(parentCategory.id)

    expect(parentCategory.children[0].id).toBe(firstChild.id)
    expect(parentCategory.children[1].id).toBe(secondChild.id)
})

test('it does not allow to add multiple relations with hasOne rule', () => {
    window.RelaDBDriver.clear()

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
    window.RelaDBDriver.clear()

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