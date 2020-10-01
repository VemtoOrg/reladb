import fs from 'fs'
import path from 'path'
import { electron } from 'process'

class ElectronJsonStorage {

    constructor() {
        this.currentKey = 'none'
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
        const mkdirp = require('mkdirp')

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

    setCurrentKey(key) {
        this.currentKey = key
    }

    getFilePathByKey(key) {
        this.setCurrentKey(key)

        if(typeof key !== 'string') throw new Error('Invalid key')
        if(!key.trim()) throw new Error('Invalid key')

        try {
            const fileName = path.basename(key, '.json') + '.json'
    
            // Preventing errors with reserved filenames in Windows
            const escapedFileName = encodeURIComponent(fileName)
    
            return path.join(this.getStorageDirectory(), escapedFileName)
        } catch (error) {
            throw new Error(this.formatError('Error trying to get file path'))
        }
    }

    getStorageDirectory() {
        return path.join(this.getUserDataDirectory(), 'storage')
    }

    getUserDataDirectory() {
        const app = electron.app || (electron.remote && electron.remote.app)

        if(app) {
            return app.getPath('userData')
        }

        return path.join('/tmp', 'storage')
    }

    formatError(message) {
        if(!this.currentKey) return message
        return `${message} | For key: ${this.currentKey}`
    }

}

export default new ElectronJsonStorage