import Field from './Field'
import Entity from './Entity'
import Model from '../../src/Model'

export default class Foreign extends Model {

    relationships() {
        return {
            field: () => this.belongsTo(Field, 'fieldId').atMostOne(),
            relatedField: () => this.belongsTo(Field, 'relatedFieldId'),
            relatedEntity: () => this.belongsTo(Entity, 'relatedEntityId'),
        }
    }

}