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
        post = Post.create({title: 'Test', ownerId: user.id})

    let tableData = User.getQuery().getTableData()

    // The index is based on table name
    expect(tableData.index[user.id].hasMany['posts.ownerId'].includes(post.id)).toBe(true)
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