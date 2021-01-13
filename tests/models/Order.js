import Model from "../../src/Model"

export default class Order extends Model {
    
    static identifier() {
        return 'Order'
    }

    static created(order) {
        order.foo = 'bar'
        order.save()   
    }

}