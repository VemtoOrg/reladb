const { default: Post } = require("./models/Post");
const { default: User } = require("./models/User");

test('it allows to get parent from belongs to relation', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        owner = post.owner
    
    expect(owner.id).toBe(user.id)
})

test('it adds has many index to parent after creating child data', () => {
    localStorage.clear()

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
    localStorage.clear()

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
    localStorage.clear()

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
    localStorage.clear()

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