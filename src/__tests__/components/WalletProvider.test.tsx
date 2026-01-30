import { WalletProvider } from "@/components/WalletProvider";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("WalletProvider", () => {
  it("renders children", () => {
    render(
      <WalletProvider>
        <div data-testid="child">Child content</div>
      </WalletProvider>,
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("wraps children with providers", () => {
    render(
      <WalletProvider>
        <span>Test</span>
      </WalletProvider>,
    );

    // Children should be rendered (providers are mocked)
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("accepts readonly children prop", () => {
    const children = <div>Readonly child</div>;
    render(<WalletProvider>{children}</WalletProvider>);

    expect(screen.getByText("Readonly child")).toBeInTheDocument();
  });
});
