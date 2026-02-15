import { EventEnvelope } from "../types";
import { DecodeErr, DecodeOk, isNonEmptyString, parseDecimalBigint, readField } from "./primitives";

export function encodeEventToStreamFields(event: EventEnvelope): ReadonlyArray<[string, string]> {
    const common: Array<[string, string]> = [
        ["v", "1"],
        ["market", event.market],
        ["kind", event.kind],
    ]

    const withIds: Array<[string, string]> = [
        ...common,
        ...(event.commandId ? [["commandId", event.commandId] as [string, string]] : []),
        ...(event.eventId ? [["eventId", event.eventId] as [string, string]] : []),
    ]

    if (event.kind === "COMMAND_REJECTED") {
        return [
            ...withIds,
            ["commandKind", event.payload.commandKind],
            ["rejectReason", event.payload.rejectReason],
        ]
    }

    const base = [
        ...withIds,
        ["bookSeq", event.bookSeq.toString(10)] as [string, string]
    ]

    if (event.kind === "TRADE") {
        return [
            ...base,
            ["takerOrderId", event.payload.takerOrderId],
            ["makerOrderId", event.payload.makerOrderId],
            ["price", event.payload.price.toString(10)],
            ["qty", event.payload.qty.toString(10)],
            ["takerSide", event.payload.takerSide],
        ];
    }

    // BOOK_DELTA
    const deltaType = event.payload.type;
    if (deltaType === "ADD") {
        return [
            ...base,
            ["deltaType", "ADD"],
            ["orderId", event.payload.orderId],
            ["side", event.payload.side],
            ["price", event.payload.price.toString(10)],
            ["qty", event.payload.qty.toString(10)],
        ];
    }
    if (deltaType === "FILL") {
        return [
            ...base,
            ["deltaType", "FILL"],
            ["makerOrderId", event.payload.makerOrderId],
            ["takerOrderId", event.payload.takerOrderId],
            ["price", event.payload.price.toString(10)],
            ["qty", event.payload.qty.toString(10)],
        ];
    }
    return [
        ...base,
        ["deltaType", "CANCEL"],
        ["orderId", event.payload.orderId],
    ];
}

export function decodeEventFromStreamFields(fields: Record<string, string>): DecodeOk<EventEnvelope> | DecodeErr {
    const market = readField(fields, "market");
    const kind = readField(fields, "kind");

    if (!isNonEmptyString(market)) {
        return {
            accepted: false,
            rejectReason: "MISSING_MARKET"
        }
    }

    if (kind !== "TRADE" && kind !== "BOOK_DELTA" && kind !== "COMMAND_REJECTED") {
        return {
            accepted: false,
            rejectReason: "INVALID_EVENT_KIND"
        }
    }

    const commandId = readField(fields, "commandId") ?? undefined;
    const eventId = readField(fields, "eventId") ?? undefined;

    if (kind === "COMMAND_REJECTED") {
        const commandKind = readField(fields, "commandKind");
        if (commandKind !== "PLACE_LIMIT" && commandKind !== "CANCEL")
            return {
                accepted: false,
                rejectReason: "INVALID_COMMAND_KIND"
            };

        const rejectReason = readField(fields, "rejectReason");
        if (!isNonEmptyString(rejectReason))
            return {
                accepted: false,
                rejectReason: "MISSING_REJECT_REASON"
            };

        return {
            accepted: true,
            value: {
                market,
                kind,
                payload: { commandKind, rejectReason: rejectReason as any },
                commandId,
                eventId,
            },
        };
    }

    const bookSeqParsed = parseDecimalBigint(readField(fields, "bookSeq"));
    if (!bookSeqParsed.ok)
        return {
            accepted: false,
            rejectReason: "MISSING_OR_INVALID_BOOK_SEQ"
        };
    const bookSeq = bookSeqParsed.value;

    if (kind === "TRADE") {
        const takerOrderId = readField(fields, "takerOrderId");
        const makerOrderId = readField(fields, "makerOrderId");
        if (!isNonEmptyString(takerOrderId))
            return {
                accepted: false,
                rejectReason: "MISSING_TAKER_ORDER_ID"
            };
        if (!isNonEmptyString(makerOrderId))
            return {
                accepted: false,
                rejectReason: "MISSING_MAKER_ORDER_ID"
            };

        const priceParsed = parseDecimalBigint(readField(fields, "price"));
        if (!priceParsed.ok)
            return {
                accepted: false,
                rejectReason: "INVALID_PRICE"
            };

        const qtyParsed = parseDecimalBigint(readField(fields, "qty"));
        if (!qtyParsed.ok)
            return {
                accepted: false,
                rejectReason: "INVALID_QTY"
            };

        const takerSide = readField(fields, "takerSide");
        if (takerSide !== "BUY" && takerSide !== "SELL")
            return {
                accepted: false,
                rejectReason: "INVALID_TAKER_SIDE"
            };

        return {
            accepted: true,
            value: {
                market,
                kind,
                bookSeq,
                payload: {
                    takerOrderId,
                    makerOrderId,
                    price: priceParsed.value,
                    qty: qtyParsed.value,
                    takerSide
                },
                commandId,
                eventId,
            },
        };
    }

    // BOOK_DELTA
    const deltaType = readField(fields, "deltaType");
    if (deltaType !== "ADD" && deltaType !== "FILL" && deltaType !== "CANCEL") {
        return {
            accepted: false,
            rejectReason: "INVALID_DELTA_TYPE"
        }
    }

    if (deltaType === "ADD") {
        const orderId = readField(fields, "orderId");
        if (!isNonEmptyString(orderId))
            return {
                accepted: false,
                rejectReason: "MISSING_ORDER_ID"
            }

        const side = readField(fields, "side");
        if (side !== "BUY" && side !== "SELL")
            return {
                accepted: false,
                rejectReason: "INVALID_SIDE"
            }

        const priceParsed = parseDecimalBigint(readField(fields, "price"));
        if (!priceParsed.ok)
            return {
                accepted: false,
                rejectReason: "INVALID_PRICE"
            }

        const qtyParsed = parseDecimalBigint(readField(fields, "qty"));
        if (!qtyParsed.ok)
            return {
                accepted: false,
                rejectReason: "INVALID_QTY"
            }

        return {
            accepted: true,
            value: {
                market,
                kind,
                bookSeq,
                payload: {
                    type: "ADD",
                    orderId,
                    side,
                    price: priceParsed.value,
                    qty: qtyParsed.value
                },
                commandId,
                eventId
            },
        }
    }

    if (deltaType === "FILL") {
        const makerOrderId = readField(fields, "makerOrderId");
        if (!isNonEmptyString(makerOrderId))
            return {
                accepted: false,
                rejectReason: "MISSING_MAKER_ORDER_ID"
            }

        const takerOrderId = readField(fields, "takerOrderId");
        if (!isNonEmptyString(takerOrderId))
            return {
                accepted: false,
                rejectReason: "MISSING_TAKER_ORDER_ID"
            }

        const priceParsed = parseDecimalBigint(readField(fields, "price"));
        if (!priceParsed.ok) return {
            accepted: false,
            rejectReason: "INVALID_PRICE"
        }

        const qtyParsed = parseDecimalBigint(readField(fields, "qty"));
        if (!qtyParsed.ok)
            return {
                accepted: false,
                rejectReason: "INVALID_QTY"
            }

        return {
            accepted: true,
            value: {
                market,
                kind,
                bookSeq,
                payload: {
                    type: "FILL",
                    makerOrderId,
                    takerOrderId,
                    price: priceParsed.value,
                    qty: qtyParsed.value
                },
                commandId,
                eventId
            },
        }
    }

    const orderId = readField(fields, "orderId");
    if (!isNonEmptyString(orderId))
        return {
            accepted: false,
            rejectReason: "MISSING_ORDER_ID"
        }

    return {
        accepted: true,
        value: {
            market,
            kind,
            bookSeq,
            payload: {
                type: "CANCEL",
                orderId
            },
            commandId,
            eventId
        },
    }
}
