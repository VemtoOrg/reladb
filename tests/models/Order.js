import Model from "../../src/Model.js"

export default class Order extends Model {

    static created(order) {
        order.foo = 'bar'
        order.save()   
    }

}