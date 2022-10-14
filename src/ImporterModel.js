const Model = require('./Model.js')

module.exports = class ImporterModel extends Model {

    static identifier() {
        return 'ImporterModel'
    }

    // static creating(data) {
    //     console.log('creating item', this.table(),  data)
        
    //     return data
    // }

    // static updating(data) {
    //     console.log('updating item', this.table(),  data)
        
    //     return data
    // }

}