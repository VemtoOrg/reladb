# RelaDB

A hybrid relational/object database layer agnostic to the storage engine.

## Overview

RelaDB is a JavaScript library that provides an elegant ORM-like interface for working with data while remaining storage engine agnostic. It supports relational data modeling with convenient methods for defining and working with relationships between models.

## Installation

```bash
npm install @tiago_silva_pereira/reladb
```

## Basic Usage

### Defining Models

```javascript
import { Model } from '@tiago_silva_pereira/reladb';

export default class User extends Model {
    relationships() {
        return {
            posts: () => this.hasMany(Post, 'ownerId', 'id'),
            document: () => this.hasOne(Document).cascadeDelete(),
            phones: () => this.hasMany(Phone, 'ownerId', 'id').cascadeDelete(),
            addresses: () => this.belongsToMany(Address, AddressUser).cascadeDetach(),
        }
    }
}
```

### Creating and Retrieving Data

```javascript
import User from './models/User';

// Create a new user
const user = User.create({ name: 'John Doe', email: 'john@example.com' });

// Find a user by ID
const foundUser = User.find(1);

// Get all users
const allUsers = User.get();

// Find with error handling
try {
    const user = User.findOrFail(1);
} catch (error) {
    console.error('User not found');
}
```

### Updating Data

```javascript
// Update by method
user.update({ name: 'Jane Doe' });

// Update by direct property assignment and save
user.name = 'Jane Doe';
user.save();
```

### Deleting Data

```javascript
user.delete();
```

### Querying Data

```javascript
// Get ordered data
const orderedUsers = User.orderBy('name').get();

// Count records
const userCount = User.count();
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
user.addListener('posts:created', (post) => {
    console.log('New post created:', post.title);
});

user.addListener('posts:updated', (post) => {
    console.log('Post updated:', post.title);
});

user.addListener('posts:deleted', (postId) => {
    console.log('Post deleted:', postId);
});

// Listen for generic events
user.addListener('updated', () => {
    console.log('User was updated');
});

// Remove listeners
const listenerId = user.addListener('updated', callback);
user.removeListener(listenerId);
user.removeListenersByName('posts:created');
user.clearListeners();
```

## Advanced Features

### Disabling Automatic Relations

```javascript
// Disable automatic relation fetching
model.disableAutomaticRelations();

// Enable automatic relation fetching
model.enableAutomaticRelations();
```

### Handling Unsaved Data

```javascript
if (model.hasUnsavedData()) {
    // Model has changes that haven't been saved
    model.save();
}
```

### Refreshing Model Data

```javascript
// Refresh model data from database
model.refresh();

// Get a fresh instance
const freshModel = model.fresh();
```

## License

MIT License - See [LICENSE.md](LICENSE.md) for details.