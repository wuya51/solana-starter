import { Header } from "@/components/Header";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockStorageAccountWithAddress } from "../helpers/mockShelby";
import {
  mockWalletConnected,
  mockWalletConnecting,
  mockWalletDisconnected,
  mockWalletWithConnectors,
} from "../helpers/mockWallet";

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWalletDisconnected();
  });

  describe("rendering", () => {
    it("renders title and description", () => {
      render(<Header currentStep={0} />);

      expect(screen.getByText("Shelby Protocol")).toBeInTheDocument();
      expect(screen.getByText("Solana Starter")).toBeInTheDocument();
      expect(
        screen.getByText("Upload blobs to Shelby using your Solana wallet"),
      ).toBeInTheDocument();
    });

    it("shows Connect Wallet button when disconnected", () => {
      mockWalletDisconnected();
      render(<Header currentStep={0} />);

      expect(
        screen.getByRole("button", { name: /Connect Wallet/i }),
      ).toBeInTheDocument();
    });

    it("shows Connecting... when connecting", () => {
      mockWalletConnecting();
      render(<Header currentStep={0} />);

      expect(
        screen.getByRole("button", { name: /Connecting.../i }),
      ).toBeInTheDocument();
    });

    it("shows formatted address when connected", () => {
      mockWalletConnected();
      render(<Header currentStep={0} />);

      // Address should be truncated: 7xKX...gAsU
      expect(
        screen.getByRole("button", { name: /7xKX.*gAsU/i }),
      ).toBeInTheDocument();
    });

    it("applies glow effect at step 0 when not connected", () => {
      mockWalletDisconnected();
      render(<Header currentStep={0} />);

      const button = screen.getByRole("button", { name: /Connect Wallet/i });
      expect(button).toHaveClass("glow-pulse");
    });

    it("does not apply glow when connected", () => {
      mockWalletConnected();
      render(<Header currentStep={0} />);

      const button = screen.getByRole("button");
      expect(button).not.toHaveClass("glow-pulse");
    });
  });

  describe("wallet modal", () => {
    it("opens modal when clicking Connect Wallet", async () => {
      const user = userEvent.setup();
      mockWalletWithConnectors([
        { id: "phantom", name: "Phantom" },
        { id: "solflare", name: "Solflare" },
      ]);

      render(<Header currentStep={0} />);

      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));

      expect(screen.getByText("Select a wallet")).toBeInTheDocument();
      expect(screen.getByText("Phantom")).toBeInTheDocument();
      expect(screen.getByText("Solflare")).toBeInTheDocument();
    });

    it("closes modal when clicking close button", async () => {
      const user = userEvent.setup();
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }]);

      render(<Header currentStep={0} />);

      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));
      expect(screen.getByText("Select a wallet")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: /Close/i }));

      await waitFor(() => {
        expect(screen.queryByText("Select a wallet")).not.toBeInTheDocument();
      });
    });

    it("closes modal on backdrop click", async () => {
      const user = userEvent.setup();
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }]);

      render(<Header currentStep={0} />);

      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));

      const backdrop = screen.getByRole("dialog");
      await user.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByText("Select a wallet")).not.toBeInTheDocument();
      });
    });

    it("calls connect when clicking wallet option", async () => {
      const user = userEvent.setup();
      const connectFn = vi.fn();
      mockWalletWithConnectors([{ id: "phantom", name: "Phantom" }], {
        connect: connectFn,
      });

      render(<Header currentStep={0} />);

      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));
      await user.click(screen.getByText("Phantom"));

      expect(connectFn).toHaveBeenCalledWith("phantom");
    });

    it("shows message when no wallets available", async () => {
      const user = userEvent.setup();
      mockWalletWithConnectors([]);

      render(<Header currentStep={0} />);

      await user.click(screen.getByRole("button", { name: /Connect Wallet/i }));

      expect(screen.getByText(/No wallets discovered/i)).toBeInTheDocument();
    });

    it("disables wallet options while connecting", async () => {
      const user = userEvent.setup();
      mockWalletConnecting({
        connectors: [{ id: "phantom", name: "Phantom" }],
      });

      render(<Header currentStep={0} />);

      // The button should say "Connecting..."
      await user.click(screen.getByRole("button", { name: /Connecting.../i }));

      // Wallet option should be disabled
      const phantomButton = screen.getByRole("button", { name: /Phantom/i });
      expect(phantomButton).toBeDisabled();
    });
  });

  describe("dropdown menu (connected)", () => {
    beforeEach(() => {
      mockWalletConnected();
      mockStorageAccountWithAddress(
        "9WzDXwBbmPdTBYSoPKGq6TqG5g8VDLJwRJBrMeVqABC1",
      );
    });

    it("opens dropdown when clicking wallet button while connected", async () => {
      const user = userEvent.setup();
      render(<Header currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /7xKX.*gAsU/i }));

      expect(screen.getByText("Wallet")).toBeInTheDocument();
      expect(screen.getByText("Storage Account")).toBeInTheDocument();
    });

    it("shows wallet address in dropdown", async () => {
      const user = userEvent.setup();
      render(<Header currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /7xKX.*gAsU/i }));

      // Should show truncated wallet address
      expect(screen.getByText(/7xKXtg.*gAsU/)).toBeInTheDocument();
    });

    it("shows disconnect button in dropdown", async () => {
      const user = userEvent.setup();
      render(<Header currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /7xKX.*gAsU/i }));

      expect(screen.getByText("Disconnect")).toBeInTheDocument();
    });

    it("calls disconnect when clicking Disconnect", async () => {
      const user = userEvent.setup();
      const disconnectFn = vi.fn();
      mockWalletConnected({ disconnect: disconnectFn });

      render(<Header currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /7xKX.*gAsU/i }));
      await user.click(screen.getByText("Disconnect"));

      expect(disconnectFn).toHaveBeenCalled();
    });

    it("closes dropdown when clicking outside", async () => {
      const user = userEvent.setup();
      render(<Header currentStep={1} />);

      await user.click(screen.getByRole("button", { name: /7xKX.*gAsU/i }));
      expect(screen.getByText("Wallet")).toBeInTheDocument();

      // Click outside the dropdown
      await user.click(document.body);

      await waitFor(() => {
        expect(screen.queryByText("Wallet")).not.toBeInTheDocument();
      });
    });
  });

  describe("address formatting", () => {
    it("formats connected address correctly", () => {
      mockWalletConnected();
      render(<Header currentStep={0} />);

      // The button should show first 4 and last 4 chars
      expect(screen.getByText(/7xKX.*gAsU/)).toBeInTheDocument();
    });
  });
});
