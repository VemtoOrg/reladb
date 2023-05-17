import Relationship from './Relationship.js'

export default class MorphMany extends Relationship {
    
    relationshipType() {
        return 'MorphMany'
    }

    setName(name) {
        this.name = name
    }

    setMorphKey(morphKey) {
        if(!morphKey) {
            morphKey = `${this.name}Id`
        }

        this.morphKey = morphKey

        return this
    }

    setMorphType(morphType) {
        if(!morphType) {
            morphType = `${this.name}Type`
        }

        this.morphType = morphType

        return this
    }

    cascadeDelete() {
        this.usesCascadeDelete = true

        return this
    }

    orderBy(field, direction = 'asc') {
        this.setFilters([{
            field: field,
            type: 'order',
            direction: direction
        }])
        
        return this
    }

    getAllItems(item) {
        return this.execute(item)
    }

    execute(item) {
        const itemModelIdentifier = item.constructor.identifier()

        let items = this.getQuery()
            .setFilters(this.filters)
            .get()

        items = items.filter(item => {
            return item[this.morphType] === itemModelIdentifier && item[this.morphKey] === item.id
        })
        
        return items || []
    }

    signature() {
        return `${this.localModel.identifier()}->MorphMany(${this.model.identifier()}):${this.morphKey},${this.morphType}`
    }

}