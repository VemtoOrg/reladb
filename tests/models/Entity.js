import Field from './Field'
import Foreign from './Foreign'
import Project from './Project'
import Model from '../../src/Model'
import Relationship from './Relationship'

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