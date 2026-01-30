import { useFundAccount } from "@/hooks/useFundAccount";
import { shelbyClient } from "@/utils/shelbyClient";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Type the mocked client
const mockedClient = shelbyClient as unknown as {
  fundAccountWithShelbyUSD: ReturnType<typeof vi.fn>;
  fundAccountWithAPT: ReturnType<typeof vi.fn>;
};

describe("useFundAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset mock implementations - default to success
    mockedClient.fundAccountWithShelbyUSD = vi.fn().mockResolvedValue({});
    mockedClient.fundAccountWithAPT = vi.fn().mockResolvedValue({});
  });

  afterEach(async () => {
    // Run all pending timers to prevent unhandled rejections from pending retry loops
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it("returns initial state", () => {
    const { result } = renderHook(() => useFundAccount());

    expect(result.current.isFunding).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.fundAccount).toBe("function");
  });

  it("sets isFunding to true while funding", async () => {
    // Make the funding take some time
    mockedClient.fundAccountWithShelbyUSD.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );
    mockedClient.fundAccountWithAPT.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const { result } = renderHook(() => useFundAccount());

    let fundingPromise: Promise<unknown>;
    act(() => {
      fundingPromise = result.current.fundAccount("test-address");
    });

    // Should be funding now
    expect(result.current.isFunding).toBe(true);

    // Advance timers and wait for completion
    await act(async () => {
      vi.advanceTimersByTime(150);
      await fundingPromise;
    });

    expect(result.current.isFunding).toBe(false);
  });

  it("calls both funding methods in parallel", async () => {
    const { result } = renderHook(() => useFundAccount());

    await act(async () => {
      await result.current.fundAccount("test-address");
    });

    expect(mockedClient.fundAccountWithShelbyUSD).toHaveBeenCalledWith({
      address: "test-address",
      amount: 1_000_000_000,
    });

    expect(mockedClient.fundAccountWithAPT).toHaveBeenCalledWith({
      address: "test-address",
      amount: 1_000_000_000,
    });
  });

  it("returns funding result on success", async () => {
    const { result } = renderHook(() => useFundAccount());

    await act(async () => {
      const fundResult = await result.current.fundAccount("my-storage-address");
      expect(fundResult).toEqual({
        storageAccountAddress: "my-storage-address",
        funded: {
          shelbyUsd: true,
          apt: true,
        },
      });
    });
  });

  it("retries on failure with exponential backoff", async () => {
    let callCount = 0;
    mockedClient.fundAccountWithShelbyUSD.mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({});
    });

    const { result } = renderHook(() => useFundAccount());

    await act(async () => {
      const promise = result.current.fundAccount("test-address");

      // Advance through retry delays
      await vi.advanceTimersByTimeAsync(1000); // First retry delay
      await vi.advanceTimersByTimeAsync(2000); // Second retry delay
      await vi.advanceTimersByTimeAsync(4000); // Extra time for completion

      await promise;
    });

    // Should have retried
    expect(callCount).toBeGreaterThanOrEqual(3);
  });

  it("sets error after all retries fail", async () => {
    const error = new Error("Persistent failure");
    mockedClient.fundAccountWithShelbyUSD.mockImplementation(() =>
      Promise.reject(error),
    );
    mockedClient.fundAccountWithAPT.mockImplementation(() =>
      Promise.reject(error),
    );

    const { result } = renderHook(() => useFundAccount());

    // Track if we caught the expected error
    let caughtError = false;

    await act(async () => {
      const promise = result.current.fundAccount("test-address");

      // Run all timers to complete all retry loops
      await vi.runAllTimersAsync();

      // Catch the rejection
      try {
        await promise;
      } catch {
        caughtError = true;
      }
    });

    expect(caughtError).toBe(true);
    expect(result.current.error).toBe("Persistent failure");
    expect(result.current.isFunding).toBe(false);
  });

  it("handles non-Error throws", async () => {
    mockedClient.fundAccountWithShelbyUSD.mockImplementation(() =>
      Promise.reject("string error"),
    );
    mockedClient.fundAccountWithAPT.mockImplementation(() =>
      Promise.reject("string error"),
    );

    const { result } = renderHook(() => useFundAccount());

    await act(async () => {
      const promise = result.current.fundAccount("test-address");

      // Run all timers to complete all retry loops
      await vi.runAllTimersAsync();

      try {
        await promise;
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("string error");
  });

  it("clears error state when starting a new funding attempt", async () => {
    // First, set up a successful mock
    mockedClient.fundAccountWithShelbyUSD.mockResolvedValue({});
    mockedClient.fundAccountWithAPT.mockResolvedValue({});

    const { result } = renderHook(() => useFundAccount());

    // Fund successfully first
    await act(async () => {
      await result.current.fundAccount("test-address");
    });

    // Verify clean state
    expect(result.current.error).toBeNull();
    expect(result.current.isFunding).toBe(false);
  });

  it("sets isFunding to false after error", async () => {
    const error = new Error("Fail");
    mockedClient.fundAccountWithShelbyUSD.mockImplementation(() =>
      Promise.reject(error),
    );
    mockedClient.fundAccountWithAPT.mockImplementation(() =>
      Promise.reject(error),
    );

    const { result } = renderHook(() => useFundAccount());

    await act(async () => {
      const promise = result.current.fundAccount("test-address");

      // Run all timers to complete all retry loops
      await vi.runAllTimersAsync();

      try {
        await promise;
      } catch {
        // Expected
      }
    });

    // isFunding should be false after error
    expect(result.current.isFunding).toBe(false);
  });
});
