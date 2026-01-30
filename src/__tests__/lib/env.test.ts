import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("env module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("exports serverEnv with NODE_ENV", async () => {
    process.env.NODE_ENV = "test";
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.NODE_ENV).toBe("test");
  });

  it("defaults NODE_ENV to development when not set", async () => {
    process.env.NODE_ENV = undefined;
    const { serverEnv } = await import("@/lib/env");
    expect(serverEnv.NODE_ENV).toBe("development");
  });

  it("exports combined env object", async () => {
    process.env.NODE_ENV = "production";
    const { env } = await import("@/lib/env");
    expect(env.NODE_ENV).toBe("production");
  });

  it("exports clientEnv object", async () => {
    const { clientEnv } = await import("@/lib/env");
    expect(clientEnv).toBeDefined();
    expect(typeof clientEnv).toBe("object");
  });
});

describe("getEnvVar function behavior", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("handles optional environment variables that are missing", async () => {
    process.env.OPTIONAL_VAR = undefined;
    // The clientEnv object uses optional vars - should not throw
    const { clientEnv } = await import("@/lib/env");
    expect(clientEnv).toBeDefined();
  });
});
