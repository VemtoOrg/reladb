
import Entity from './Entity'
import Model from '../../src/Model'

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