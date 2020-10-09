export default class Database {

    constructor() {
        this.events = {}
        this.deletingBuffer = {}
    }

    isAlreadyDeleting(table, id) {
        if(!this.deletingBuffer[table]) return false
        return !! this.deletingBuffer[table][id]
    }

    addToDeletingBuffer(table, id) {
        if(!this.deletingBuffer[table]) {
            this.deletingBuffer[table] = {}
        }

        this.deletingBuffer[table][id] = true
        
        if(this.deletingBufferListener) this.deletingBufferListener(this.cloneProperty('deletingBuffer'))
    }

    removeFromDeletingBuffer(table, id) {
        if(!this.deletingBuffer[table]) return
        delete this.deletingBuffer[table][id]
        
        if(this.deletingBufferListener) this.deletingBufferListener(this.cloneProperty('deletingBuffer'))
    }

    registerDeletingBufferListener(listenerFunction) {
        this.deletingBufferListener = listenerFunction
    }

    cloneProperty(property) {
        return JSON.parse(JSON.stringify(this[property]))
    }
}