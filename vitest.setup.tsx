import "@testing-library/jest-dom/vitest";
import { afterAll, beforeAll, vi } from "vitest";

// Suppress unhandled rejection warnings from parallel Promise.all retry loops
// These occur when testing error scenarios with parallel async operations
// where one promise rejects and the other's retry loop continues
const originalUnhandledRejection = process.listeners("unhandledRejection");
beforeAll(() => {
  process.removeAllListeners("unhandledRejection");
  process.on("unhandledRejection", () => {
    // Silently ignore unhandled rejections in tests
  });
});

afterAll(() => {
  process.removeAllListeners("unhandledRejection");
  for (const listener of originalUnhandledRejection) {
    process.on(
      "unhandledRejection",
      listener as NodeJS.UnhandledRejectionListener,
    );
  }
});

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useParams: () => ({}),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => {
    // biome-ignore lint/a11y/useAltText: alt is passed via props
    return <img src={src} alt={alt} {...props} />;
  },
}));

// Mock @solana/react-hooks
vi.mock("@solana/react-hooks", () => ({
  useWalletConnection: vi.fn(() => ({
    connectors: [],
    connect: vi.fn(),
    disconnect: vi.fn(),
    wallet: null,
    status: "disconnected",
  })),
  SolanaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @solana/client
vi.mock("@solana/client", () => ({
  createClient: vi.fn(() => ({})),
  autoDiscover: vi.fn(() => []),
}));

// Mock @shelby-protocol/sdk/browser
vi.mock("@shelby-protocol/sdk/browser", () => ({
  ShelbyClient: vi.fn().mockImplementation(() => ({
    fundAccountWithShelbyUSD: vi.fn().mockResolvedValue({}),
    fundAccountWithAPT: vi.fn().mockResolvedValue({}),
  })),
}));

// Mock @shelby-protocol/solana-kit/react
vi.mock("@shelby-protocol/solana-kit/react", () => ({
  useStorageAccount: vi.fn(() => ({
    storageAccountAddress: null,
    signAndSubmitTransaction: vi.fn(),
  })),
  Network: {
    SHELBYNET: "shelbynet",
  },
}));

// Mock @shelby-protocol/react
vi.mock("@shelby-protocol/react", () => ({
  useUploadBlobs: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock react-confetti
vi.mock("react-confetti", () => ({
  default: () => <div data-testid="confetti" />,
}));

// Mock react-dom createPortal
vi.mock("react-dom", async () => {
  const actual = await vi.importActual("react-dom");
  return {
    ...actual,
    createPortal: (children: React.ReactNode) => children,
  };
});

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn().mockResolvedValue(""),
};

Object.defineProperty(navigator, "clipboard", {
  value: mockClipboard,
  writable: true,
  configurable: true,
});

// Mock window.scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Make sure userEvent can use the clipboard
Object.defineProperty(global.navigator, 'clipboard', {
  value: mockClipboard as unknown as Clipboard,
  writable: true,
  configurable: true
});
