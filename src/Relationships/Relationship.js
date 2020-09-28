import Query from "../Query"

export default class Relationship {

    constructor(model, localModel) {
        this.model = model
        this.localModel = localModel
    }

    getQuery() {
        return new Query(this.model)
    }

}