import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import RootLayout from "../app/layout";
import { GoogleAnalytics } from "../components/google-analytics";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-migos-locale": "en", "x-migos-pathname": "/" }),
}));

describe("analytics site integration", () => {
  it("mounts GA4 on every page through the root layout with a valid measurement ID", async () => {
    const layout = await RootLayout({ children: <main>Home</main> });
    const body = layout.props.children as ReactElement<{ children: ReactNode }>;
    const analytics = Children.toArray(body.props.children).find(
      child => isValidElement(child) && child.type === GoogleAnalytics,
    ) as ReactElement<{ measurementId?: string }> | undefined;

    expect(analytics?.props.measurementId).toBe("G-SKCH8EV8M2");
  });
});
