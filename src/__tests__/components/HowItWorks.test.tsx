import { HowItWorks } from "@/components/HowItWorks";
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("HowItWorks", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("step display", () => {
    it("renders all three steps", () => {
      render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      expect(screen.getByText("Connect Wallet")).toBeInTheDocument();
      expect(screen.getByText("Fund Account")).toBeInTheDocument();
      expect(screen.getByText("Upload Blobs")).toBeInTheDocument();
    });

    it("renders step descriptions", () => {
      render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      expect(
        screen.getByText("Phantom, Solflare, or other wallet"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Airdrop tokens from the faucet"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Store data with Shelby via Solana"),
      ).toBeInTheDocument();
    });

    it("shows step numbers for incomplete steps", () => {
      render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      expect(screen.getByText("1")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });
  });

  describe("step completion", () => {
    it("shows checkmark for completed step 1", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // Step 1 should have checkmark (check for SVG title)
      expect(screen.getByTitle("Step complete")).toBeInTheDocument();

      // Steps 2 and 3 should still show numbers
      expect(screen.getByText("2")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows checkmarks for completed steps 1 and 2", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={false}
        />,
      );

      // Two checkmarks should be visible
      const checkmarks = screen.getAllByTitle("Step complete");
      expect(checkmarks).toHaveLength(2);

      // Step 3 should still show number
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("shows all checkmarks when all steps complete", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={true}
        />,
      );

      const checkmarks = screen.getAllByTitle("Step complete");
      expect(checkmarks).toHaveLength(3);
    });
  });

  describe("step styling", () => {
    it("highlights current step (first incomplete)", () => {
      const { container } = render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // Step 1 should be highlighted as current
      const stepCircles = container.querySelectorAll(".w-10.h-10.rounded-full");
      expect(stepCircles[0]).toHaveClass("ring-2");
    });

    it("dims future steps", () => {
      const { container } = render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // Future steps should have muted styling
      const stepCircles = container.querySelectorAll(".w-10.h-10.rounded-full");
      expect(stepCircles[1]).toHaveClass("bg-muted/50");
      expect(stepCircles[2]).toHaveClass("bg-muted/50");
    });
  });

  describe("confetti animation", () => {
    it("shows confetti when all steps complete", async () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={true}
        />,
      );

      expect(screen.getByTestId("confetti")).toBeInTheDocument();
    });

    it("does not show confetti when steps incomplete", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={false}
        />,
      );

      expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    });

    it("initially shows confetti when all steps complete", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={true}
        />,
      );

      // Confetti should be visible initially
      expect(screen.getByTestId("confetti")).toBeInTheDocument();
    });

    it("confetti is not shown when not all steps are complete", () => {
      render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // No confetti when not all steps complete
      expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    });

    it("resets confetti trigger when steps become incomplete", async () => {
      const { rerender } = render(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={true}
        />,
      );

      expect(screen.getByTestId("confetti")).toBeInTheDocument();

      // Advance past confetti duration
      vi.advanceTimersByTime(5000);

      // Make steps incomplete
      rerender(
        <HowItWorks
          isWalletConnected={true}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // Complete again
      rerender(
        <HowItWorks
          isWalletConnected={true}
          isFunded={true}
          hasUploadedBlob={true}
        />,
      );

      // Confetti should trigger again
      expect(screen.getByTestId("confetti")).toBeInTheDocument();
    });
  });

  describe("window resize handling", () => {
    it("updates window size on resize", () => {
      render(
        <HowItWorks
          isWalletConnected={false}
          isFunded={false}
          hasUploadedBlob={false}
        />,
      );

      // Trigger resize event
      window.dispatchEvent(new Event("resize"));

      // Component should handle resize without errors
      expect(screen.getByText("How It Works")).toBeInTheDocument();
    });
  });
});
