import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
    resolve: {
        alias: {
            "@arbitium/ts-shared": path.resolve(__dirname, "../ts-shared/src"),
            "@arbitium/ts-engine-client": path.resolve(__dirname, "./src"),
        }
    },
    test: { environment: "node" }
});
