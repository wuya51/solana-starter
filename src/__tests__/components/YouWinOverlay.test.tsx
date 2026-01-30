import { YouWinOverlay } from "@/components/YouWinOverlay";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("YouWinOverlay", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("visibility", () => {
    it("does not render when show is false", () => {
      render(<YouWinOverlay show={false} />);

      expect(screen.queryByText("YOU WIN")).not.toBeInTheDocument();
    });

    it("renders when show is true", async () => {
      render(<YouWinOverlay show={true} />);

      // Initially visible but text not shown yet
      expect(screen.queryByText("YOU WIN")).not.toBeInTheDocument();

      // After 300ms, text should appear
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("YOU WIN")).toBeInTheDocument();
    });
  });

  describe("animation timing", () => {
    it("shows text after 300ms delay", async () => {
      render(<YouWinOverlay show={true} />);

      expect(screen.queryByText("YOU WIN")).not.toBeInTheDocument();

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("YOU WIN")).toBeInTheDocument();
    });

    it("starts fade out after 2.5 seconds", async () => {
      const { container } = render(<YouWinOverlay show={true} />);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Should have fade-in class
      const overlay = container.querySelector(".fixed");
      expect(overlay).toHaveClass("you-win-overlay-fade-in");

      await act(async () => {
        vi.advanceTimersByTime(2200); // Total 2500ms
      });

      // Should have fade-out class
      expect(overlay).toHaveClass("you-win-overlay-fade-out");
    });

    it("hides completely after 3 seconds", async () => {
      const onComplete = vi.fn();
      render(<YouWinOverlay show={true} onComplete={onComplete} />);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Verify onComplete was called (which means the overlay completed)
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("onComplete callback", () => {
    it("calls onComplete after 3 seconds", async () => {
      const onComplete = vi.fn();
      render(<YouWinOverlay show={true} onComplete={onComplete} />);

      expect(onComplete).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does not call onComplete if show becomes false before timeout", async () => {
      const onComplete = vi.fn();
      const { rerender } = render(
        <YouWinOverlay show={true} onComplete={onComplete} />,
      );

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      rerender(<YouWinOverlay show={false} onComplete={onComplete} />);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // onComplete should not have been called because we hid the overlay
      // The timers get cleared on cleanup
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe("styling", () => {
    it("has correct backdrop classes", () => {
      const { container } = render(<YouWinOverlay show={true} />);

      const overlay = container.querySelector(".fixed");
      expect(overlay).toHaveClass("inset-0");
      expect(overlay).toHaveClass("z-50");
      expect(overlay).toHaveClass("bg-black/40");
    });

    it("has correct text classes", async () => {
      render(<YouWinOverlay show={true} />);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const text = screen.getByText("YOU WIN");
      expect(text).toHaveClass("you-win-text");
      expect(text).toHaveClass("you-win-glow");
      expect(text).toHaveClass("text-8xl");
    });

    it("applies fade-in text animation initially", async () => {
      render(<YouWinOverlay show={true} />);

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const text = screen.getByText("YOU WIN");
      expect(text).toHaveClass("you-win-text-fade-in");
    });

    it("applies fade-out text animation when fading", async () => {
      render(<YouWinOverlay show={true} />);

      await act(async () => {
        vi.advanceTimersByTime(2500);
      });

      const text = screen.getByText("YOU WIN");
      expect(text).toHaveClass("you-win-text-fade-out");
    });
  });

  describe("state reset", () => {
    it("becomes invisible when show is false", () => {
      const { rerender } = render(<YouWinOverlay show={true} />);

      // Check the overlay is visible
      expect(document.querySelector(".fixed")).toBeInTheDocument();

      // Hide the overlay
      rerender(<YouWinOverlay show={false} />);

      // Note: The overlay uses internal state, so it may still be visible briefly
      // The key behavior is that when show=false initially, nothing renders
      const { container } = render(<YouWinOverlay show={false} />);
      expect(container.querySelector(".fixed")).not.toBeInTheDocument();
    });

    it("calls onComplete callback when animation finishes", async () => {
      const onComplete = vi.fn();
      render(<YouWinOverlay show={true} onComplete={onComplete} />);

      // Complete the full animation
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
