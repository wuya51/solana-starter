import { shelbyClient } from "@/utils/shelbyClient";
import { useUploadBlobs } from "@shelby-protocol/react";
import { useStorageAccount } from "@shelby-protocol/solana-kit/react";
import { vi } from "vitest";

type MockedUseStorageAccount = ReturnType<typeof vi.fn>;
type MockedUseUploadBlobs = ReturnType<typeof vi.fn>;

export interface MockStorageAccountState {
  storageAccountAddress?: { toString: () => string } | null;
  signAndSubmitTransaction?: ReturnType<typeof vi.fn>;
}

export interface MockUploadBlobsState {
  mutateAsync?: ReturnType<typeof vi.fn>;
  isPending?: boolean;
}

export function mockStorageAccount(overrides: MockStorageAccountState = {}) {
  const state = {
    storageAccountAddress: null,
    signAndSubmitTransaction: vi.fn(),
    ...overrides,
  };
  (useStorageAccount as MockedUseStorageAccount).mockReturnValue(state);
  return state;
}

export function mockStorageAccountWithAddress(address: string) {
  return mockStorageAccount({
    storageAccountAddress: { toString: () => address },
    signAndSubmitTransaction: vi.fn().mockResolvedValue({}),
  });
}

export function mockUploadBlobs(overrides: MockUploadBlobsState = {}) {
  const state = {
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
    ...overrides,
  };
  (useUploadBlobs as MockedUseUploadBlobs).mockReturnValue(state);
  return state;
}

export function mockUploadBlobsPending() {
  return mockUploadBlobs({ isPending: true });
}

export function mockUploadBlobsError(errorMessage: string) {
  return mockUploadBlobs({
    mutateAsync: vi.fn().mockRejectedValue(new Error(errorMessage)),
  });
}

export function mockShelbyClientFunding() {
  const fundAccountWithShelbyUSD = vi.fn().mockResolvedValue({});
  const fundAccountWithAPT = vi.fn().mockResolvedValue({});

  // Access the mocked shelbyClient
  (
    shelbyClient as unknown as {
      fundAccountWithShelbyUSD: ReturnType<typeof vi.fn>;
      fundAccountWithAPT: ReturnType<typeof vi.fn>;
    }
  ).fundAccountWithShelbyUSD = fundAccountWithShelbyUSD;
  (
    shelbyClient as unknown as {
      fundAccountWithShelbyUSD: ReturnType<typeof vi.fn>;
      fundAccountWithAPT: ReturnType<typeof vi.fn>;
    }
  ).fundAccountWithAPT = fundAccountWithAPT;

  return { fundAccountWithShelbyUSD, fundAccountWithAPT };
}

export function mockShelbyClientFundingError(errorMessage: string) {
  const fundAccountWithShelbyUSD = vi
    .fn()
    .mockRejectedValue(new Error(errorMessage));
  const fundAccountWithAPT = vi.fn().mockRejectedValue(new Error(errorMessage));

  (
    shelbyClient as unknown as {
      fundAccountWithShelbyUSD: ReturnType<typeof vi.fn>;
      fundAccountWithAPT: ReturnType<typeof vi.fn>;
    }
  ).fundAccountWithShelbyUSD = fundAccountWithShelbyUSD;
  (
    shelbyClient as unknown as {
      fundAccountWithShelbyUSD: ReturnType<typeof vi.fn>;
      fundAccountWithAPT: ReturnType<typeof vi.fn>;
    }
  ).fundAccountWithAPT = fundAccountWithAPT;

  return { fundAccountWithShelbyUSD, fundAccountWithAPT };
}
