export function flattenStreamFields(fields: ReadonlyArray<[string, string]>): string[] {
    if (fields.length === 0) throw new RangeError("EMPTY_FIELD")
    if (fields.length > 64) throw new RangeError("TOO_MANY_FIELDS")

    const flatten: string[] = []
    for (const [fieldKey, fieldValue] of fields) {
        if (typeof fieldKey !== 'string' || fieldKey.length === 0) {
            throw new TypeError("FIELD_KEY_INVALID")
        }

        if (typeof fieldValue !== 'string') {
            throw new TypeError("FIELD_VALUE_INVALID")
        }

        flatten.push(fieldKey, fieldValue)
    }

    return flatten
}