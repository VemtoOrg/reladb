import Field from './Field.js'
import Foreign from './Foreign.js'
import Project from './Project.js'
import Model from '../../src/Model.js'
import Relationship from './Relationship.js'

export default class Entity extends Model {

    static identifier() {
        return 'Entity'
    }

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            relations: () => this.hasMany(Relationship).cascadeDelete(),
            fields: () => this.hasMany(Field).orderBy('order').cascadeDelete(),
            foreigns: () => this.hasMany(Foreign, 'relatedEntityId').cascadeDelete(),
        }
    }

}