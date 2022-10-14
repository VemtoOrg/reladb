import Entity from './Entity.js'
import Model from '../../src/Model.js'

export default class Project extends Model {

    static identifier() {
        return 'Project'
    }

    relationships() {
        return {
            entities: () => this.hasMany(Entity).cascadeDelete(),
        }
    }

}