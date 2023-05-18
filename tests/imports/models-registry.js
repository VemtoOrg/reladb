import Resolver from '../../src/Resolver.js'
import Address from '../models/Address.js'
import AddressUser from '../models/AddressUser.js'
import Category from '../models/Category.js'
import Comment from '../models/Comment.js'
import Document from '../models/Document.js'
import Entity from '../models/Entity.js'
import Field from '../models/Field.js'
import Foreign from '../models/Foreign.js'
import Order from '../models/Order.js'
import Person from '../models/Person.js'
import Phone from '../models/Phone.js'
import Photo from '../models/Photo.js'
import Post from '../models/Post.js'
import Project from '../models/Project.js'
import Relationship from '../models/Relationship.js'
import Tag from '../models/Tag.js'
import User from '../models/User.js'

Resolver.onDatabaseReady(() => {
    Resolver.db().registerModel(Category, 'Category')
    Resolver.db().registerModel(Comment, 'Comment')
    Resolver.db().registerModel(Document, 'Document')
    Resolver.db().registerModel(Entity, 'Entity')
    Resolver.db().registerModel(Field, 'Field')
    Resolver.db().registerModel(Foreign, 'Foreign')
    Resolver.db().registerModel(Order, 'Order')
    Resolver.db().registerModel(Person, 'Person')
    Resolver.db().registerModel(Phone, 'Phone')
    Resolver.db().registerModel(Photo, 'Photo')
    Resolver.db().registerModel(Post, 'Post')
    Resolver.db().registerModel(Project, 'Project')
    Resolver.db().registerModel(Relationship, 'Relationship')
    Resolver.db().registerModel(User, 'User')
    Resolver.db().registerModel(Tag, 'Tag')
    Resolver.db().registerModel(Address, 'Address')
    Resolver.db().registerModel(AddressUser, 'AddressUser')
})