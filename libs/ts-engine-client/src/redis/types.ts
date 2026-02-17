export type RedisClient = {
    sendCommand(args: ReadonlyArray<string>): Promise<unknown>;
    connect(): Promise<void>;
    quit(): Promise<void>;
    on(event: "error", listener: (error: unknown) => void): void;
};