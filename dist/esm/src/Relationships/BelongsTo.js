import Relationship from './Relationship.js';
export default class BelongsTo extends Relationship {
    relationshipType() {
        return 'BelongsTo';
    }
    atMostOne() {
        this.allowsOnlyOne = true;
        return this;
    }
    setForeignKey(foreignKey) {
        if (!foreignKey) {
            foreignKey = `${this.model.defaultKeyIdentifier().toLowerCase()}Id`;
        }
        this.foreignKey = foreignKey;
        return this;
    }
    setOwnerKey(ownerKey) {
        if (!ownerKey) {
            ownerKey = this.model.primaryKey();
        }
        this.ownerKey = ownerKey;
        return this;
    }
    getParentFromItem() {
        const item = this.getItem();
        if (!item[this.foreignKey])
            return null;
        return this.getQuery().find(item[this.foreignKey]);
    }
    execute() {
        return this.getParentFromItem();
    }
    signature() {
        let type = this.allowsOnlyOne ? 'BelongsTo_One' : 'BelongsTo';
        return `${this.localModel.identifier()}->${type}(${this.model.identifier()}):${this.foreignKey},${this.ownerKey}`;
    }
    /**
     * Gets the inverse relationship for firing events (only works for BelongsTo/HasMany relationships)
     * @returns {Relationship}
     */
    inverse() {
        let modelInstance = new (this.model), relationships = modelInstance.relationships();
        let inverseRelationshipName = Object.keys(relationships).find(relationshipName => {
            let relationship = relationships[relationshipName];
            if (!relationship)
                return null;
            let relationshipInstance = relationship();
            return relationshipInstance.type === 'HasMany'
                && relationshipInstance.foreignKey === this.foreignKey
                && relationshipInstance.localModel.identifier() == this.model.identifier()
                && relationshipInstance.model.identifier() == this.localModel.identifier();
        });
        if (!inverseRelationshipName)
            return null;
        if (!relationships[inverseRelationshipName])
            return null;
        let relationship = relationships[inverseRelationshipName]();
        relationship.setNameOnModel(inverseRelationshipName);
        return relationship;
    }
}
