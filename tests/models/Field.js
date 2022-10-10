import Entity from './Entity.js'
import Foreign from './Foreign.js'
import Model from '../../src/Model.js'

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