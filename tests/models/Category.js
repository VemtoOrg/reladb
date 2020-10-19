import Model from "../../src/Model";

export default class Category extends Model {
    
    static identifier() {
        return 'Category'
    }

    relationships() {
        return {
            parent: () => this.belongsTo(Category, 'parentId'),
            children: () => this.hasMany(Category, 'parentId'),
        }
    }

}