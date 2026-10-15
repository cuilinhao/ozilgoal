import { describe, expect, it } from "vitest";
import { isAnalyticsHost } from "./google-analytics";

describe("analytics production host", () => {
  it("allows only the Ozil Goal Generator domain and its www host", () => {
    expect(isAnalyticsHost("ozilgoal-aivideo.com")).toBe(true);
    expect(isAnalyticsHost("www.ozilgoal-aivideo.com")).toBe(true);
    expect(isAnalyticsHost("migosai.design")).toBe(false);
    expect(isAnalyticsHost("ozilgoal-aivideo.com.evil.example")).toBe(false);
    expect(isAnalyticsHost("localhost")).toBe(false);
  });
});
