export function parseBigIntDecimal(input: string | undefined | null): bigint {
    if (!input || input === "undefined" || input === "null") {
        return 0n;
    }
    const sanitized = input.toString().replace(/,/g, '');
    if (!/^\d+$/.test(sanitized)) {
        throw new Error(`[bigint] Invalid decimal bigint: "${input}"`);
    }
    return BigInt(sanitized);
}

export function clampMinBigInt(value: bigint, minValue: bigint): bigint {
    return value < minValue ? minValue : value;
}

export function formatBpsAsPercent(bps: bigint): string {
    const negative = bps < 0n;
    const absBps = negative ? -bps : bps;

    const integerPart = absBps / 100n;
    const fractionalPart = absBps % 100n;
    const fractionalText = fractionalPart.toString().padStart(2, "0");

    const sign = negative ? "-" : "+";
    return `${sign}${integerPart.toString()}.${fractionalText}%`;
}