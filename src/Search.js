export function binarySearch(targetArray, value) {
    let low = 0,
        high = targetArray.length - 1,
        mid

    while (low <= high) {
        mid = (low + high) >>> 1

        let int_val = targetArray[mid]

        if (!isNaN(targetArray[mid])) {
            int_val = parseInt(targetArray[mid])
        }

        if (int_val == value) {
            return true
        } else if (int_val < value) {
            low = mid + 1
        } else {
            high = mid - 1
        }
    }

    return -1
}
