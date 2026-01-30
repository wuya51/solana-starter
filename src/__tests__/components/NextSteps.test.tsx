import { NextSteps } from "@/components/NextSteps";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

describe("NextSteps", () => {
  describe("rendering", () => {
    it("renders the title", () => {
      render(<NextSteps />);

      expect(screen.getByText("Next Steps")).toBeInTheDocument();
    });

    it("renders the congratulations message", () => {
      render(<NextSteps />);

      expect(
        screen.getByText(/Congratulations on your first upload/),
      ).toBeInTheDocument();
    });

    it("renders all four links", () => {
      render(<NextSteps />);

      expect(screen.getByText("Explore the Shelby docs")).toBeInTheDocument();
      expect(screen.getByText("Learn more about Shelby")).toBeInTheDocument();
      expect(
        screen.getByText("Join our Discord community"),
      ).toBeInTheDocument();
      expect(screen.getByText("Try the Shelby quickstart")).toBeInTheDocument();
    });

    it("renders links with correct hrefs", () => {
      render(<NextSteps />);

      expect(
        screen.getByText("Explore the Shelby docs").closest("a"),
      ).toHaveAttribute("href", "https://docs.shelby.xyz");
      expect(
        screen.getByText("Learn more about Shelby").closest("a"),
      ).toHaveAttribute("href", "https://shelby.xyz");
      expect(
        screen.getByText("Join our Discord community").closest("a"),
      ).toHaveAttribute("href", "https://discord.gg/shelbyserves");
      expect(
        screen.getByText("Try the Shelby quickstart").closest("a"),
      ).toHaveAttribute("href", "https://github.com/shelby/shelby-quickstart");
    });

    it("opens links in new tab", () => {
      render(<NextSteps />);

      const links = screen.getAllByRole("link");
      for (const link of links) {
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
      }
    });
  });

  describe("glow effect", () => {
    it("applies glow class when showGlow is true", () => {
      const { container } = render(<NextSteps showGlow={true} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("glow-pulse");
    });

    it("does not apply glow class when showGlow is false", () => {
      const { container } = render(<NextSteps showGlow={false} />);

      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass("glow-pulse");
    });

    it("does not apply glow class by default", () => {
      const { container } = render(<NextSteps />);

      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass("glow-pulse");
    });
  });

  describe("onLinkClick callback", () => {
    it("calls onLinkClick when a link is clicked", async () => {
      const user = userEvent.setup();
      const onLinkClick = vi.fn();

      render(<NextSteps onLinkClick={onLinkClick} />);

      await user.click(screen.getByText("Explore the Shelby docs"));

      expect(onLinkClick).toHaveBeenCalledTimes(1);
    });

    it("calls onLinkClick for each link clicked", async () => {
      const user = userEvent.setup();
      const onLinkClick = vi.fn();

      render(<NextSteps onLinkClick={onLinkClick} />);

      await user.click(screen.getByText("Explore the Shelby docs"));
      await user.click(screen.getByText("Learn more about Shelby"));

      expect(onLinkClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("ref forwarding", () => {
    it("forwards ref to the container div", () => {
      const ref = createRef<HTMLDivElement>();

      render(<NextSteps ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current).toHaveClass("glass-neon");
    });

    it("ref element contains the correct content", () => {
      const ref = createRef<HTMLDivElement>();

      render(<NextSteps ref={ref} />);

      expect(ref.current?.textContent).toContain("Next Steps");
    });
  });

  describe("styling", () => {
    it("has glass-neon class on container", () => {
      const { container } = render(<NextSteps />);

      expect(container.firstChild).toHaveClass("glass-neon");
      expect(container.firstChild).toHaveClass("rounded-xl");
    });

    it("renders icons with correct styling", () => {
      const { container } = render(<NextSteps />);

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBe(4);

      for (const icon of icons) {
        expect(icon).toHaveClass("w-5");
        expect(icon).toHaveClass("h-5");
      }
    });
  });
});
