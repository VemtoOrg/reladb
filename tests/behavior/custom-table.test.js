import User from "../models/User.js"
import Post from "../models/Post.js"
import Database from "../../src/Database.js"
import Resolver from "../../src/Resolver.js"
import LocalStorage from "../../src/Drivers/LocalStorage.js"

let database = new Database()
database.setDriver(LocalStorage)

import "../imports/models-registry.js"

Resolver.onDatabaseReady(() => {
    Resolver.db().registerModel(User, "User", "user_table")
})

Resolver.setDatabase(database)

afterEach(() => {
    Resolver.db().driver.clear()
})

test("it can register a custom table name for a model", () => {
    expect(Post.table()).toBe("posts")
    expect(Post.defaultTable()).toBe("posts")

    expect(User.table()).toBe("user_table")
    expect(User.defaultTable()).toBe("users")

    let user = User.create({ name: "Tiago" }),
        post = Post.create({ name: "Post" })

    expect(user.getTable()).toBe("user_table")
    expect(post.getTable()).toBe("posts")
})
