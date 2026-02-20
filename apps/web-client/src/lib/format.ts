export function formatPrice(raw: string, scale: number): string {
    if (!raw || raw === "0") {
        return scale > 0 ? `₹0.${"0".repeat(scale)}` : "₹0";
    }

    const isNegative = raw.startsWith("-");
    const abs = isNegative ? raw.slice(1) : raw;
    const padded = abs.padStart(scale + 1, "0");
    const wholeStr = padded.slice(0, padded.length - scale);
    const fracStr = scale > 0 ? padded.slice(-scale) : "";

    const formattedWhole = BigInt(wholeStr).toLocaleString("en-IN");
    const prefix = isNegative ? "-₹" : "₹";

    return scale > 0 ? `${prefix}${formattedWhole}.${fracStr}` : `${prefix}${formattedWhole}`;
}

export function formatQty(raw: string, scale: number = 0): string {
    if (!raw || raw === "0") return "0";

    if (scale === 0) {
        return BigInt(raw).toLocaleString("en-IN");
    }

    const padded = raw.padStart(scale + 1, "0");
    const wholeStr = padded.slice(0, padded.length - scale);
    const fracStr = padded.slice(-scale);
    return `${BigInt(wholeStr).toLocaleString("en-IN")}.${fracStr}`;
}
