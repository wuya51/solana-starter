import { describe, expect, it } from "vitest";

describe("shelbyClient", () => {
  it("exports a shelbyClient instance", async () => {
    const { shelbyClient } = await import("@/utils/shelbyClient");
    expect(shelbyClient).toBeDefined();
  });

  it("exports a singleton client instance", async () => {
    const { shelbyClient: client1 } = await import("@/utils/shelbyClient");
    const { shelbyClient: client2 } = await import("@/utils/shelbyClient");

    // Both imports should reference the same module-level instance
    expect(client1).toBe(client2);
  });

  it("client has expected funding methods", async () => {
    const { shelbyClient } = await import("@/utils/shelbyClient");

    expect(shelbyClient.fundAccountWithShelbyUSD).toBeDefined();
    expect(shelbyClient.fundAccountWithAPT).toBeDefined();
  });

  it("client has correct type", async () => {
    const { shelbyClient } = await import("@/utils/shelbyClient");
    expect(typeof shelbyClient.fundAccountWithShelbyUSD).toBe("function");
    expect(typeof shelbyClient.fundAccountWithAPT).toBe("function");
  });
});
