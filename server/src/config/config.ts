import { Type } from "@sinclair/typebox";
import { config } from "dotenv";
import path from "path";

if (process.env.NODE_ENV !== "production") {
  config({ path: path.resolve(__dirname, "../../../.env") });
}

export const ConfigSchema = Type.Object({
  PORT: Type.Number({
    default: 3001,
    minimum: 1,
    maximum: 65535,
  }),
  NODE_ENV: Type.Union(
    [
      Type.Literal("development"),
      Type.Literal("production"),
      Type.Literal("test"),
    ],
    { default: "development" }
  ),
});

export const appConfig = {
  PORT: parseInt(process.env.PORT || "3001", 10),
  NODE_ENV:
    (process.env.NODE_ENV as "development" | "production" | "test") ||
    "development", // defaults to development
};

const validEnvs = ["development", "production", "test"];
if (!validEnvs.includes(appConfig.NODE_ENV)) {
  throw new Error(
    `❌ Invalid NODE_ENV: ${
      appConfig.NODE_ENV
    }. Must be one of: ${validEnvs.join(", ")}`
  );
}

const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
};

export const secrets = {
  CLIENT_ID: requireEnv("CLIENT_ID"),
  CLIENT_SECRET: requireEnv("CLIENT_SECRET"),
  REDIRECT_URI: requireEnv("REDIRECT_URI"),
  REFRESH_TOKEN: requireEnv("REFRESH_TOKEN"),
  DISCORD_WEBHOOK_URL: requireEnv("DISCORD_WEBHOOK_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  MONGO_URI: requireEnv("MONGO_URI"),
};
