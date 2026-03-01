import { execSync } from "node:child_process";
import path from "node:path";

export async function setup(): Promise<void> {
    execSync("pnpm db:push --accept-data-loss", {
        cwd: path.resolve(__dirname, "../../../"),
        stdio: "inherit",
    });
}
