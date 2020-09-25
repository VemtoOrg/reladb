const { default: Post } = require("./models/Post");
const { default: User } = require("./models/User");

test('it allows to get data from relation', () => {
    localStorage.clear()

    let user = User.create({name: 'Tiago'}),
        post = Post.create({title: 'Test', ownerId: user.id}),
        owner = post.owner
    
    console.log(owner)

    expect(owner.id).toBe(user.id)
    // expect(user.posts[0].id).toBe(post.id)
})