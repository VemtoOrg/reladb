import Field from './Field.js'
import Entity from './Entity.js'
import Model from '../../src/Model.js'

export default class Foreign extends Model {

    relationships() {
        return {
            field: () => this.belongsTo(Field, 'fieldId').atMostOne(),
            relatedField: () => this.belongsTo(Field, 'relatedFieldId'),
            relatedEntity: () => this.belongsTo(Entity, 'relatedEntityId'),
        }
    }

}