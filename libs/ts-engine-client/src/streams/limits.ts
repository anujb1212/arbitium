export function toPositiveInt(value: number, name: string, max: number): number {
    if (!Number.isInteger(value) || value <= 0) {
        throw new RangeError(`${name}_MUST_BE_POSITIVE_INT`)
    }

    if (value > max) throw new RangeError(`${name}_TOO_LARGE`)

    return value
}

export function requiredIntegerInRange(params: {
    value: number,
    name: string,
    min: number,
    max: number
}): number {
    const { value, name, min, max } = params

    if (!Number.isInteger(value)) throw RangeError(`${name}_MUST_BE_POSITIVE_INT`)
    if (value < min) throw new RangeError(`${name}_TOO_SMALL`)
    if (value > max) throw new RangeError(`${name}_TOO_LARGE`)

    return value
}