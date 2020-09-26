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