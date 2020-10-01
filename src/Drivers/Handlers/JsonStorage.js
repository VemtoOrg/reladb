const fs = window.require('fs')
const path = window.require('path')
const electron = window.require('electron')

class JsonStorage {

    constructor() {
        this.currentKey = 'none'
        this.relativePath = ''
    }

    setRelativePath(path) {
        this.relativePath = path

        return this
    }

    set(key, data) {
        this.setCurrentKey(key)

        let filePath = this.getFilePathByKey(key),
            jsonFromData = this.convertDataToJson(data)

        this.createFolderIfNecessary()

        try {
            fs.writeFileSync(filePath, jsonFromData, 'utf8')
        } catch (error) {
            throw new Error(this.formatError('Cannot write the storage file'))
        }

        return true
    }

    createFolderIfNecessary() {
        const mkdirp = window.require('mkdirp')

        try {
            mkdirp.sync(this.getStorageDirectory())
        } catch (error) {
            throw new Error(this.formatError('Cannot create the storage directory'))
        }
    }

    convertDataToJson(data) {
        let jsonFromData

        try {
            jsonFromData = JSON.stringify(data)
            if(!jsonFromData) throw new Error(this.formatError('Invalid JSON data'))

            return jsonFromData
        } catch (error) {
            throw new Error(this.formatError('Invalid data. Cannot be transformed into JSON'))
        }
    }

    get(key) {
        this.setCurrentKey(key)

        let filePath = this.getFilePathByKey(key)

        try {
            if(!fs.existsSync(filePath)) return null

            return JSON.parse(fs.readFileSync(filePath, 'utf8'))            
        } catch (error) {
            return null
        }
    }

    remove(key) {
        this.setCurrentKey(key)

        let filePath = this.getFilePathByKey(key)

        try {
            return JSON.parse(fs.unlinkSync(filePath))            
        } catch (error) {
            throw new Error(this.formatError('Failed to remove'))
        }
    }

    clear() {
        try {
            fs.rmdirSync(this.getStorageDirectory(false), { recursive: true })
        } catch (error) {
            throw new Error(this.formatError('Cannot clear database storage'))
        }
    }

    setCurrentKey(key) {
        this.currentKey = key
    }

    getFilePathByKey(key) {
        this.setCurrentKey(key)

        if(typeof key !== 'string') throw new Error(this.formatError('Invalid key'))
        if(!key.trim()) throw new Error(this.formatError('Invalid key'))

        try {
            const fileName = path.basename(key, '.json') + '.json'
    
            // Preventing errors with reserved filenames in Windows
            const escapedFileName = encodeURIComponent(fileName)
    
            return path.join(this.getStorageDirectory(), escapedFileName)
        } catch (error) {
            throw new Error(this.formatError('Error trying to get file path'))
        }
    }

    getStorageDirectory(withRelative = true) {
        return path.join(this.getUserDataDirectory(), 'storage', 'reladb', 'json', withRelative ? this.relativePath : '')
    }

    getUserDataDirectory() {
        const app = electron.app || (electron.remote && electron.remote.app)

        if(app) {
            return app.getPath('userData')
        }

        return path.join('/tmp', 'storage', 'reladb')
    }

    formatError(message) {
        if(!this.currentKey) return message
        return `${message} | For key: ${this.currentKey}`
    }

}

export default new JsonStorage