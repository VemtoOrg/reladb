import HasMany from "./HasMany"

export default class HasOne extends HasMany {

    getAllItems(item) {
        return super.execute(item)
    }

    execute(item) {
        return super.execute(item)[0]
    }

}