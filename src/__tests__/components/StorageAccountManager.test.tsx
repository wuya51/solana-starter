import { StorageAccountManager } from "@/components/StorageAccountManager";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockStorageAccount,
  mockStorageAccountWithAddress,
} from "../helpers/mockShelby";
import {
  mockWalletConnected,
  mockWalletDisconnected,
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

describe("StorageAccountManager", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletDisconnected();
    mockStorageAccount();
  });

  describe("disconnected state", () => {
    it("shows connect message when wallet not connected", () => {
      mockWalletDisconnected();
      renderWithProviders(<StorageAccountManager currentStep={0} />);

      expect(screen.getByText("Storage Account")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Connect your Solana wallet to view your storage account.",
        ),
      ).toBeInTheDocument();
    });

    it("does not show fund button when disconnected", () => {
      mockWalletDisconnected();
      renderWithProviders(<StorageAccountManager currentStep={0} />);

      expect(
        screen.queryByRole("button", { name: /Fund Account/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("connected state", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress(
        "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
      );
    });

    it("shows storage account section when connected", () => {
      renderWithProviders(<StorageAccountManager currentStep={1} />);

      expect(screen.getByText("Storage Account")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Your Shelby storage account is automatically derived/,
        ),
      ).toBeInTheDocument();
    });

    it("displays storage account address", () => {
      renderWithProviders(<StorageAccountManager currentStep={1} />);

      expect(
        screen.getByText("9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1"),
      ).toBeInTheDocument();
    });

    it("shows Fund Account button", () => {
      renderWithProviders(<StorageAccountManager currentStep={1} />);

      expect(
        screen.getByRole("button", { name: /Fund Account/i }),
      ).toBeInTheDocument();
    });

    it("applies glow effect at step 1", () => {
      renderWithProviders(<StorageAccountManager currentStep={1} />);

      const fundButton = screen.getByRole("button", { name: /Fund Account/i });
      expect(fundButton).toHaveClass("glow-pulse");
    });

    it("does not apply glow effect at other steps", () => {
      renderWithProviders(<StorageAccountManager currentStep={0} />);

      const fundButton = screen.getByRole("button", { name: /Fund Account/i });
      expect(fundButton).not.toHaveClass("glow-pulse");
    });
  });

  describe("funding flow", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress(
        "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
      );
    });

    it("calls fundAccount when clicking Fund Account button", async () => {
      const user = userEvent.setup();
      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      expect(mockFundAccount).toHaveBeenCalledWith(
        "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
      );
    });

    it("shows status message during funding", async () => {
      const user = userEvent.setup();
      let resolveFunding: () => void;
      const fundingPromise = new Promise<void>((resolve) => {
        resolveFunding = resolve;
      });

      const mockFundAccount = vi.fn().mockImplementation(() => {
        return fundingPromise.then(() => ({
          storageAccountAddress: "test",
          funded: { shelbyUsd: true, apt: true },
        }));
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      expect(
        screen.getByText("Funding account with ShelbyUSD and APT..."),
      ).toBeInTheDocument();

      resolveFunding?.();
    });

    it("shows Funding... on button while isFunding is true", () => {
      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: vi.fn(),
        isFunding: true,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      expect(
        screen.getByRole("button", { name: /Funding.../i }),
      ).toBeInTheDocument();
    });

    it("disables button while funding", () => {
      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: vi.fn(),
        isFunding: true,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      expect(
        screen.getByRole("button", { name: /Funding.../i }),
      ).toBeDisabled();
    });

    it("shows Funded badge after successful funding", async () => {
      const user = userEvent.setup();
      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        expect(screen.getByText("Funded")).toBeInTheDocument();
      });
    });

    it("shows success toast after funding", async () => {
      const user = userEvent.setup();
      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "test",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          "Account funded successfully!",
        );
      });
    });

    it("disables Fund Account button after funding", async () => {
      const user = userEvent.setup();
      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "test",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Fund Account/i }),
        ).toBeDisabled();
      });
    });
  });

  describe("error handling", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("test-address");
    });

    it("shows error toast when funding fails", async () => {
      const user = userEvent.setup();
      const mockFundAccount = vi
        .fn()
        .mockRejectedValue(new Error("Funding failed"));

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(<StorageAccountManager currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Funding failed");
      });
    });
  });

  describe("callbacks", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress("callback-test-address");
    });

    it("calls onStorageAccountReady when storage account is available", () => {
      const onStorageAccountReady = vi.fn();

      renderWithProviders(
        <StorageAccountManager
          currentStep={1}
          onStorageAccountReady={onStorageAccountReady}
        />,
      );

      expect(onStorageAccountReady).toHaveBeenCalledWith(
        "callback-test-address",
      );
    });

    it("calls onAccountFunded after successful funding", async () => {
      const user = userEvent.setup();
      const onAccountFunded = vi.fn();
      const mockFundAccount = vi.fn().mockResolvedValue({
        storageAccountAddress: "test",
        funded: { shelbyUsd: true, apt: true },
      });

      (useFundAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        fundAccount: mockFundAccount,
        isFunding: false,
        error: null,
      });

      renderWithProviders(
        <StorageAccountManager
          currentStep={1}
          onAccountFunded={onAccountFunded}
        />,
      );

      await user.click(screen.getByRole("button", { name: /Fund Account/i }));

      await waitFor(() => {
        expect(onAccountFunded).toHaveBeenCalled();
      });
    });
  });
});
