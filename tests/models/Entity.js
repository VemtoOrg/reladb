import Field from './Field'
import Foreign from './Foreign'
import Project from './Project'
import Model from '../../src/Model'

export default class Entity extends Model {

    relationships() {
        return {
            project: () => this.belongsTo(Project),
            fields: () => this.hasMany(Field).orderBy('order').cascadeDelete(),
            foreigns: () => this.hasMany(Foreign, 'relatedEntityId').cascadeDelete(),
        }
    }

}