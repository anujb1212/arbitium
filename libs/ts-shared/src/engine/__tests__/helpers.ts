
export function pairsToRecord(pairs: ReadonlyArray<[string, string]>): Record<string, string> {
    const record: Record<string, string> = {};

    for (const [fieldName, fieldValue] of pairs) record[fieldName] = fieldValue;

    return record;
}