import { BookDelta, CancelInput, PlaceLimitInput, Trade } from "../orderbook/types";

export type EngineCommand = PlaceLimitInput | CancelInput

export type EngineEvents = Trade | BookDelta