import Entity from './Entity'
import Model from '../../src/Model'

export default class Relationship extends Model {

    static identifier() {
        return 'Relationship'
    }

    relationships() {
        return {
            entity: () => this.belongsTo(Entity),
            inverse: () => this.belongsTo(Relationship, 'inverseId').atMostOne(),
            contrary: () => this.hasOne(Relationship, 'inverseId').cascadeDelete(),
        }
    }

}