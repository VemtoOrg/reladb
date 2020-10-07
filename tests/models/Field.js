import Foreign from './Foreign'
import Model from '../../src/Model'

export default class Field extends Model {

    relationships() {
        return {
            foreign: () => this.hasOne(Foreign, 'fieldId').cascadeDelete(),
            relatedForeigns: () => this.hasMany(Foreign, 'relatedFieldId').cascadeDelete(),
        }
    }
    
}