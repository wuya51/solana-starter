import { useWalletConnection } from "@solana/react-hooks";
import { vi } from "vitest";

type MockedUseWalletConnection = ReturnType<typeof vi.fn>;

export interface MockWalletState {
  connectors?: Array<{ id: string; name: string }>;
  connect?: ReturnType<typeof vi.fn>;
  disconnect?: ReturnType<typeof vi.fn>;
  wallet?: {
    account: {
      address: {
        toString: () => string;
      };
    };
  } | null;
  status?: "disconnected" | "connecting" | "connected";
}

const defaultDisconnectedState: MockWalletState = {
  connectors: [],
  connect: vi.fn(),
  disconnect: vi.fn(),
  wallet: null,
  status: "disconnected",
};

const defaultConnectedState: MockWalletState = {
  connectors: [
    { id: "phantom", name: "Phantom" },
    { id: "solflare", name: "Solflare" },
  ],
  connect: vi.fn(),
  disconnect: vi.fn(),
  wallet: {
    account: {
      address: {
        toString: () => "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      },
    },
  },
  status: "connected",
};

export function mockWalletDisconnected(
  overrides: Partial<MockWalletState> = {},
) {
  const state = { ...defaultDisconnectedState, ...overrides };
  (useWalletConnection as MockedUseWalletConnection).mockReturnValue(state);
  return state;
}

export function mockWalletConnected(overrides: Partial<MockWalletState> = {}) {
  const state = { ...defaultConnectedState, ...overrides };
  (useWalletConnection as MockedUseWalletConnection).mockReturnValue(state);
  return state;
}

export function mockWalletConnecting(overrides: Partial<MockWalletState> = {}) {
  const state = {
    ...defaultDisconnectedState,
    status: "connecting" as const,
    connectors: [
      { id: "phantom", name: "Phantom" },
      { id: "solflare", name: "Solflare" },
    ],
    ...overrides,
  };
  (useWalletConnection as MockedUseWalletConnection).mockReturnValue(state);
  return state;
}

export function mockWalletWithConnectors(
  connectors: Array<{ id: string; name: string }>,
  overrides: Partial<MockWalletState> = {},
) {
  const state = { ...defaultDisconnectedState, connectors, ...overrides };
  (useWalletConnection as MockedUseWalletConnection).mockReturnValue(state);
  return state;
}

export function createMockWalletAddress(address: string) {
  return {
    account: {
      address: {
        toString: () => address,
      },
    },
  };
}
