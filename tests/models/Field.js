import Entity from './Entity'
import Foreign from './Foreign'
import Model from '../../src/Model'

export default class Field extends Model {

    static identifier() {
        return 'Field'
    }

    relationships() {
        return {
            entity: () => this.belongsTo(Entity),
            foreign: () => this.hasOne(Foreign, 'fieldId').cascadeDelete(),
            relatedForeigns: () => this.hasMany(Foreign, 'relatedFieldId').cascadeDelete(),
        }
    }
    
}