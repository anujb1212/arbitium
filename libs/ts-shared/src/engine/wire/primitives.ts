export type DecodeOk<T> = {
    accepted: true;
    value: T
}

export type DecodeErr = {
    accepted: false;
    rejectReason: string
}

export function isNonEmptyString(value: unknown): value is string {
    return typeof value === "string" && value.length > 0
}

export function isDecimalBigintString(value: unknown): value is string {
    if (typeof value !== "string" || value.length === 0) return false

    if (value[0] === "0") return value.length === 1

    for (let i = 0; i < value.length; i++) {
        const code = value.charCodeAt(i)
        if (code < 48 || code > 57) return false  // '0'=48, '9'=57
    }

    return true
}

export function parseDecimalBigint(value: unknown): { ok: true; value: bigint } | { ok: false; reason: string } {
    if (!isDecimalBigintString(value)) {
        return {
            ok: false,
            reason: "INVALID_BIGINT_DECIMAL_STRING"
        }
    }

    try {
        return {
            ok: true,
            value: BigInt(value)
        }
    } catch {
        return {
            ok: false,
            reason: "INVALID_BIGINT_DECIMAL_STRING"
        }
    }
}

export function readField(fields: Record<string, string>, key: string): string | null {
    const value = fields[key]

    return typeof value === "string" ? value : null
}