import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthCard } from "../auth-provider";

describe("account form", () => {
  it("offers email login with password-manager autocomplete", () => {
    const html = renderToStaticMarkup(<AuthCard authConfigured />);
    expect(html).toContain('type="email"');
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('type="submit"');
  });
  it("offers registration with a new password and an accessible password toggle", () => {
    const html = renderToStaticMarkup(<AuthCard kind="sign-up" authConfigured />);
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain('minLength="8"');
    expect(html).toContain('aria-label="Show password"');
    expect(html).toContain('href="/privacy-policy"');
  });
  it("keeps email sign-in available without advertising unconfigured Google OAuth", () => {
    const html = renderToStaticMarkup(<AuthCard authConfigured={false} emailAuthConfigured />);
    expect(html).toContain('type="email"');
    expect(html).toContain('type="submit"');
    expect(html).not.toContain('Continue with Google');
    expect(html).not.toContain('mi-auth-divider');
  });
  it("offers Google alongside email when OAuth is configured", () => {
    const html = renderToStaticMarkup(<AuthCard authConfigured emailAuthConfigured />);
    expect(html).toContain('Continue with Google');
    expect(html).toContain('mi-auth-divider');
    expect(html).toContain('type="email"');
  });
});
