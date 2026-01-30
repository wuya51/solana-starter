import Home from "@/app/page";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockFile } from "../helpers/mockFile";
import {
  mockStorageAccount,
  mockStorageAccountWithAddress,
  mockUploadBlobs,
} from "../helpers/mockShelby";
import {
  mockWalletConnected,
  mockWalletDisconnected,
  mockWalletWithConnectors,
} from "../helpers/mockWallet";
import { renderWithProviders } from "../helpers/renderWithProviders";

// Mock useFundAccount
vi.mock("@/hooks/useFundAccount", () => ({
  useFundAccount: vi.fn(() => ({
    fundAccount: vi.fn().mockResolvedValue({
      storageAccountAddress: "test-address",
      funded: { shelbyUsd: true, apt: true },
    }),
    isFunding: false,
    error: null,
  })),
}));

import { useFundAccount } from "@/hooks/useFundAccount";

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockWalletDisconnected();
    mockStorageAccount();
    mockUploadBlobs();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("initial render", () => {
    it("renders all main sections", () => {
      renderWithProviders(<Home />);

      expect(screen.getByText("Shelby Protocol")).toBeInTheDocument();
      expect(screen.getByText("How It Works")).toBeInTheDocument();
      expect(screen.getByText("Storage Account")).toBeInTheDocument();
      expect(screen.getByText("Upload Blob")).toBeInTheDocument();
    });

    it("does not show NextSteps initially", () => {
      renderWithProviders(<Home />);

      expect(screen.queryByText("Next Steps")).not.toBeInTheDocument();
    });

    it("shows Connect Wallet button with glow", () => {
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }]);
      renderWithProviders(<Home />);

      const connectButton = screen.getByRole("button", {
        name: /Connect Wallet/i,
      });
      expect(connectButton).toHaveClass("glow-pulse");
    });
  });

  describe("step progression", () => {
    it("step 0: Connect Wallet button has glow", () => {
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }]);
      renderWithProviders(<Home />);

      const connectButton = screen.getByRole("button", {
        name: /Connect Wallet/i,
      });
      expect(connectButton).toHaveClass("glow-pulse");
    });

    it("step 1: Fund Account button has glow when connected", () => {
      mockWalletConnected();
      mockStorageAccountWithAddress("test-storage-address");

      // Mock useFundAccount to return non-funded state
      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: vi.fn().mockResolvedValue({
          storageAccountAddress: "test-storage-address",
          funded: { shelbyUsd: true, apt: true },
        }),
        isFunding: false,
        error: null,
      });

      renderWithProviders(<Home />);

      const fundButton = screen.getByRole("button", { name: /Fund Account/i });
      expect(fundButton).toHaveClass("glow-pulse");
    });
  });

  describe("component orchestration", () => {
    it("Header receives currentStep", () => {
      mockWalletDisconnected();
      renderWithProviders(<Home />);

      // At step 0, connect button should have glow
      const connectButton = screen.getByRole("button", {
        name: /Connect Wallet/i,
      });
      expect(connectButton).toHaveClass("glow-pulse");
    });

    it("HowItWorks receives step completion states", () => {
      mockWalletConnected();
      mockStorageAccountWithAddress("test-address");

      renderWithProviders(<Home />);

      // Step 1 (Connect) should be complete
      const checkmarks = screen.getAllByTitle("Step complete");
      expect(checkmarks.length).toBeGreaterThanOrEqual(1);
    });

    it("StorageAccountManager callbacks update parent state", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      mockWalletConnected();
      mockStorageAccountWithAddress("callback-test-address");

      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "callback-test-address",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<Home />);

      // Fund the account
      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        // After funding, HowItWorks should show 2 checkmarks
        const checkmarks = screen.getAllByTitle("Step complete");
        expect(checkmarks.length).toBe(2);
      });
    });

    it("BlobUploader receives correct storageAccountAddress", () => {
      mockWalletConnected();
      mockStorageAccountWithAddress("blob-test-address");

      renderWithProviders(<Home />);

      // Before funding, BlobUploader should show fund message
      expect(
        screen.getByText("Fund your storage account first to upload blobs."),
      ).toBeInTheDocument();
    });
  });

  describe("full user flow", () => {
    it("wallet connection flow works", async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      // Start disconnected
      const connectFn = vi.fn();
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }], {
        connect: connectFn,
      });

      renderWithProviders(<Home />);

      // Step 1: Open wallet modal
      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));
      expect(screen.getByText("Select a wallet")).toBeInTheDocument();

      // Step 2: Click wallet option
      await user.click(screen.getByText("Phantom"));

      expect(connectFn).toHaveBeenCalledWith("phantom");
    });
  });

  describe("YouWinOverlay", () => {
    it("YouWinOverlay component is rendered but hidden initially", () => {
      mockWalletDisconnected();
      renderWithProviders(<Home />);

      // YouWinOverlay starts hidden (no "YOU WIN" text visible)
      expect(screen.queryByText("YOU WIN")).not.toBeInTheDocument();
    });
  });

  describe("NextSteps visibility", () => {
    it("NextSteps is not shown until blob is uploaded", () => {
      mockWalletConnected();
      mockStorageAccountWithAddress("test-address");

      renderWithProviders(<Home />);

      // NextSteps should not be visible initially
      expect(screen.queryByText("Next Steps")).not.toBeInTheDocument();
    });
  });

  describe("confetti behavior", () => {
    it("confetti is not shown when steps are incomplete", () => {
      mockWalletConnected();
      mockStorageAccountWithAddress("test-address");

      renderWithProviders(<Home />);

      // Confetti should not be visible when not all steps are complete
      expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    });
  });
});
