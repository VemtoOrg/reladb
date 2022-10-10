const fakeStorage = {
    data: {},
    getItem(key) {
        return this.data[key]
    },
    setItem(key, value) {
        this.data[key] = value
    },
    removeItem(key) {
        delete this.data[key]
    },
    clear() {
        this.data = {}
    }
}

fakeStorage.clear()

let times = 3000000

let t0 = performance.now()

for (let index = 0; index < times; index++) {
    fakeStorage.setItem('test' + index, index)    
}

let t1 = performance.now()

console.log(`\x1b[36m%s\x1b[0m`, `Total time 01 ${(t1 - t0).toFixed(2)} ms.`)

// Tentativa 2

fakeStorage.clear()

t0 = performance.now()

for (let index = 0; index < times; index++) {
    fakeStorage.data['test' + index] = index    
}

t1 = performance.now()

console.log(`\x1b[36m%s\x1b[0m`, `Total time 02 ${(t1 - t0).toFixed(2)} ms.`)