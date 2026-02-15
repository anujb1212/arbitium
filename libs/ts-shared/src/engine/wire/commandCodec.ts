import { CommandEnvelope } from "../types";
import { DecodeErr, DecodeOk, isNonEmptyString, parseDecimalBigint, readField } from "./primitives";

export function encodeCommandToStreamFields(command: CommandEnvelope): ReadonlyArray<[string, string]> {
    const common: Array<[string, string]> = [
        ["v", "1"],
        ["market", command.market],
        ["kind", command.kind],
        ["commandId", command.commandId],
    ]

    if (command.kind === "PLACE_LIMIT") {
        return [
            ...common,
            ["orderId", command.payload.orderId],
            ["side", command.payload.side],
            ["price", command.payload.price.toString(10)],
            ["qty", command.payload.qty.toString(10)]
        ]
    }

    return [
        ...common,
        ["orderId", command.payload.orderId]
    ]
}

export function decodeCommandFromStreamFields(fields: Record<string, string>): DecodeOk<CommandEnvelope> | DecodeErr {
    const market = readField(fields, "market");
    const kind = readField(fields, "kind");
    const commandId = readField(fields, "commandId");

    if (!isNonEmptyString(market)) return {
        accepted: false,
        rejectReason: "MISSING_MARKET"
    }

    if (!isNonEmptyString(commandId)) return {
        accepted: false,
        rejectReason: "MISSING_COMMAND_ID"
    }

    if (kind !== "PLACE_LIMIT" && kind !== "CANCEL") return {
        accepted: false,
        rejectReason: "INVALID_COMMAND_KIND"
    }

    const orderId = readField(fields, "orderId");
    if (!isNonEmptyString(orderId)) return {
        accepted: false,
        rejectReason: "MISSING_ORDER_ID"
    }

    if (kind === "CANCEL") {
        return {
            accepted: true,
            value: {
                market,
                kind,
                commandId,
                payload: { orderId }
            }
        }
    }

    const side = readField(fields, "side");
    if (side !== "BUY" && side !== "SELL") return {
        accepted: false,
        rejectReason: "INVALID_SIDE"
    }

    const priceParsed = parseDecimalBigint(readField(fields, "price"));
    if (!priceParsed.ok) return {
        accepted: false,
        rejectReason: "INVALID_PRICE"
    }

    const qtyParsed = parseDecimalBigint(readField(fields, "qty"));
    if (!qtyParsed.ok) return {
        accepted: false,
        rejectReason: "INVALID_QTY"
    }

    return {
        accepted: true,
        value: {
            market,
            kind,
            commandId,
            payload: {
                orderId,
                side,
                price: priceParsed.value,
                qty: qtyParsed.value
            }
        }
    }
}
