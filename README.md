# RelaDB

A hybrid relational/object database layer agnostic to the storage engine.

This database layer was created to be used with Vemto, a Desktop Laravel code generation application, and you can read more details about its creation here:

[Why did I create my own database?](https://tiagosilvapereira3.medium.com/why-did-i-create-my-own-database-85efbb2a8bc8)

## Overview

RelaDB is a JavaScript library that provides an elegant ORM-like interface for working with data while remaining storage engine agnostic. It supports relational data modeling with convenient methods for defining and working with relationships between models.

## Installation

```bash
npm install @tiago_silva_pereira/reladb
```

## Basic Usage

### Defining Models

```javascript
import { Model } from "@tiago_silva_pereira/reladb"

export default class User extends Model {
    relationships() {
        return {
            posts: () => this.hasMany(Post, "ownerId", "id"),
            document: () => this.hasOne(Document).cascadeDelete(),
            phones: () => this.hasMany(Phone, "ownerId", "id").cascadeDelete(),
            addresses: () => this.belongsToMany(Address, AddressUser).cascadeDetach(),
        }
    }
}
```

### Registering Models

Models must be registered with RelaDB to be properly recognized by the system:

```javascript
import Resolver from "@tiago_silva_pereira/reladb/src/Resolver.js"
import User from "./models/User.js"
import Post from "./models/Post.js"
import Document from "./models/Document.js"

// Register models when the database is ready
Resolver.onDatabaseReady(() => {
    // Register a model with its class name
    Resolver.db().registerModel(User, "User")

    // Register a model with custom table name
    Resolver.db().registerModel(Post, "Post", "blog_posts")

    Resolver.db().registerModel(Document, "Document")
    // Register other models...
})
```

### Configuring Storage Drivers

RelaDB is designed to be storage-agnostic. You can choose between different storage drivers or create your own:

```javascript
import Resolver from "@tiago_silva_pereira/reladb/src/Resolver.js"
import RAMStorage from "@tiago_silva_pereira/reladb/src/Drivers/RAMStorage.js"
// import LocalStorage from '@tiago_silva_pereira/reladb/src/Drivers/LocalStorage.js'
// import IndexedDBStorage from '@tiago_silva_pereira/reladb/src/Drivers/IndexedDBStorage.js'

// Configure the database with the RAM storage driver
Resolver.setDB({
    driver: RAMStorage,
})

// For persistent storage in a browser environment:
// Resolver.setDB({ driver: LocalStorage })
// Resolver.setDB({ driver: IndexedDBStorage })

// Custom configuration example:
// Resolver.setDB({
//     driver: CustomStorage,
//     config: {
//         url: 'https://api.example.com/data',
//         apiKey: 'your-api-key'
//     }
// })
```

#### Creating Custom Storage Driver

You can create your own storage driver by extending the base Driver class:

```javascript
import Driver from "@tiago_silva_pereira/reladb/src/Drivers/Driver.js"

class CustomStorage extends Driver {
    constructor(config = {}) {
        super()
        this.config = config
    }

    // Implement required driver methods
    setFromDriver(key, data) {
        /* Implementation */
    }
    getFromDriver(key) {
        /* Implementation */
    }
    removeFromDriver(key) {
        /* Implementation */
    }
    clearFromDriver() {
        /* Implementation */
    }
    getAllTableNames() {
        /* Implementation */
    }
}

export default new CustomStorage()
```

### Creating and Retrieving Data

```javascript
import User from "./models/User"

// Create a new user
const user = User.create({ name: "John Doe", email: "john@example.com" })

// Find a user by ID
const foundUser = User.find(1)

// Get all users
const allUsers = User.get()

// Find with error handling
try {
    const user = User.findOrFail(1)
} catch (error) {
    console.error("User not found")
}
```

### Updating Data

```javascript
// Update by method
user.update({ name: "Jane Doe" })

// Update by direct property assignment and save
user.name = "Jane Doe"
user.save()
```

### Deleting Data

```javascript
user.delete()
```

### Querying Data

```javascript
// Get ordered data
const orderedUsers = User.orderBy("name").get()

// Count records
const userCount = User.count()
```

## Working with Relationships

### One-to-Many Relationships

```javascript
// Define a relationship in the User model
relationships() {
    return {
        posts: () => this.hasMany(Post, 'ownerId', 'id')
    }
}

// Access the relationship
const user = User.find(1);
const userPosts = user.posts;  // Array of related posts
```

### Many-to-One Relationships

```javascript
// Define a relationship in the Post model
relationships() {
    return {
        owner: () => this.belongsTo(User, 'ownerId')
    }
}

// Access the relationship
const post = Post.find(1);
const postOwner = post.owner;  // Related user object
```

### One-to-One Relationships

```javascript
// Define a relationship
relationships() {
    return {
        document: () => this.hasOne(Document)
    }
}

// Access the relationship
const user = User.find(1);
const userDocument = user.document;  // Related document object
```

### Many-to-Many Relationships

```javascript
// Define a relationship
relationships() {
    return {
        addresses: () => this.belongsToMany(Address, AddressUser)
    }
}

// Access the relationship
const user = User.find(1);
const userAddresses = user.addresses;  // Array of related addresses

// Attach and detach relationships
user.relation('addresses').attach(address);
user.relation('addresses').attachUnique(address);
user.relation('addresses').detach(address);
user.relation('addresses').detachAll();
```

### Polymorphic Relationships

```javascript
// Define a morphTo relationship
relationships() {
    return {
        taggable: () => this.morphTo('taggable')
    }
}

// Define a morphMany relationship
relationships() {
    return {
        tags: () => this.morphMany(Tag, 'taggable')
    }
}
```

## Cascade Deletion

RelaDB supports automatic cascade deletion for related data. This feature allows you to automatically delete child records when a parent record is deleted, maintaining referential integrity in your data.

### How Cascade Deletion Works

When you define a relationship with `cascadeDelete: true`, deleting a parent record will automatically delete all associated child records. This prevents orphaned records and ensures data consistency.

#### Example: Basic Cascade Deletion

```javascript
import { Model } from "@tiago_silva_pereira/reladb"

export default class User extends Model {
    relationships() {
        return {
            posts: () => this.hasMany(Post, "ownerId", "id").cascadeDelete(),
        }
    }
}

const user = User.find(1)
user.delete() // This will also delete all posts related to the user
```

#### Example: Cascade Deletion with Multiple Relationships

```javascript
import { Model } from "@tiago_silva_pereira/reladb"

export default class User extends Model {
    relationships() {
        return {
            posts: () => this.hasMany(Post, "ownerId", "id").cascadeDelete(),
            document: () => this.hasOne(Document).cascadeDelete(),
            phones: () => this.hasMany(Phone, "ownerId", "id").cascadeDelete(),
        }
    }
}

const user = User.find(1)
user.delete() // This will delete the user and all related posts, document, and phones
```

## Event Handling

### Model Lifecycle Events

```javascript
// Define events in your model
static creating(data) {
    data.email = 'default@example.com';
    return data;
}

static created(model) {
    // Do something after model is created
}

static beforeUpdate(data) {
    // Modify data before update
    return data;
}

static updating(data, oldData) {
    // Do something during update
    return data;
}

static updated(model) {
    // Do something after model is updated
}

static deleting(model) {
    // Do something before model is deleted
    return true; // Return false to cancel deletion
}

static deleted(modelId) {
    // Do something after model is deleted
}
```

### Adding Event Listeners

```javascript
// Listen for relationship events
user.addListener("posts:created", (post) => {
    console.log("New post created:", post.title)
})

user.addListener("posts:updated", (post) => {
    console.log("Post updated:", post.title)
})

user.addListener("posts:deleted", (postId) => {
    console.log("Post deleted:", postId)
})

// Listen for generic events
user.addListener("updated", () => {
    console.log("User was updated")
})

// Remove listeners
const listenerId = user.addListener("updated", callback)
user.removeListener(listenerId)
user.removeListenersByName("posts:created")
user.clearListeners()
```

## Advanced Features

### Disabling Automatic Relations

```javascript
// Disable automatic relation fetching
model.disableAutomaticRelations()

// Enable automatic relation fetching
model.enableAutomaticRelations()
```

### Handling Unsaved Data

```javascript
if (model.hasUnsavedData()) {
    // Model has changes that haven't been saved
    model.save()
}
```

### Refreshing Model Data

```javascript
// Refresh model data from database
model.refresh()

// Get a fresh instance
const freshModel = model.fresh()
```

## License

MIT License - See [LICENSE.md](LICENSE.md) for details.
