import HasMany from "./HasMany"

export default class HasOne extends HasMany {

    execute(item) {
        return super.execute(item)[0]
    }

}