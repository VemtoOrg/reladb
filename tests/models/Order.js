import Model from "../../src/Model.js"

export default class Order extends Model {
    
    static identifier() {
        return 'Order'
    }

    static created(order) {
        order.foo = 'bar'
        order.save()   
    }

}