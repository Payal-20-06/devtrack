import { describe, expect, it } from "vitest";
import { detectBrowserLocale, detectLocale, normalizeLocale } from "@/i18n/detection";
import { translateMessage } from "@/i18n/translate";

describe("normalizeLocale", () => {
  it("normalizes valid locales", () => {
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("es")).toBe("es");
  });

  it("normalizes valid locales with region/case", () => {
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("EN-US")).toBe("en");
    expect(normalizeLocale("es-ES")).toBe("es");
  });

  it("returns null for invalid locale strings", () => {
    expect(normalizeLocale("fr")).toBe(null);
    expect(normalizeLocale("invalid")).toBe(null);
    expect(normalizeLocale("123")).toBe(null);
  });

  it("returns null for null, undefined, and empty string", () => {
    expect(normalizeLocale(null)).toBe(null);
    expect(normalizeLocale(undefined)).toBe(null);
    expect(normalizeLocale("")).toBe(null);
  });

  it("handles edge cases like whitespace", () => {
    expect(normalizeLocale("  en  ")).toBe("en");
  });
});

describe("detectLocale", () => {
  it("prioritizes preferredLocale > cookieLocale > browserLocale > default", () => {
    expect(
      detectLocale({
        preferredLocale: "es",
        cookieLocale: "en",
        acceptLanguage: "en-US,en;q=0.9",
      })
    ).toEqual({ locale: "es", source: "preference" });
  });

  it("uses preferredLocale when provided", () => {
    expect(detectLocale({ preferredLocale: "es" })).toEqual({
      locale: "es",
      source: "preference",
    });
  });

  it("uses cookieLocale when preferredLocale is missing", () => {
    expect(detectLocale({ cookieLocale: "es" })).toEqual({
      locale: "es",
      source: "cookie",
    });
    expect(detectLocale({ preferredLocale: null, cookieLocale: "es" })).toEqual({
      locale: "es",
      source: "cookie",
    });
  });

  it("uses browserLocale when preferred and cookie are missing", () => {
    expect(detectLocale({ acceptLanguage: "es-ES,es;q=0.8" })).toEqual({
      locale: "es",
      source: "browser",
    });
  });

  it("returns default when nothing exists or matches", () => {
    expect(detectLocale({})).toEqual({ locale: "en", source: "default" });
    expect(
      detectLocale({
        preferredLocale: "fr",
        cookieLocale: "de",
        acceptLanguage: "it",
      })
    ).toEqual({ locale: "en", source: "default" });
  });
});

describe("detectBrowserLocale", () => {
  it("parses accept-language header correctly", () => {
    expect(detectBrowserLocale("es,en;q=0.9")).toBe("es");
    expect(detectBrowserLocale("en,es;q=0.9")).toBe("en");
  });

  it("respects quality values (q values)", () => {
    expect(detectBrowserLocale("en;q=0.5,es;q=0.8")).toBe("es");
    expect(detectBrowserLocale("en;q=0.9,es;q=0.1")).toBe("en");
  });

  it("handles mixed case locales", () => {
    expect(detectBrowserLocale("ES-es,en;Q=0.5")).toBe("es");
  });

  it("returns null when no supported languages are found", () => {
    expect(detectBrowserLocale("fr-FR,fr;q=0.9")).toBe(null);
    expect(detectBrowserLocale(null)).toBe(null);
    expect(detectBrowserLocale("")).toBe(null);
  });

  it("detects supported browser languages from complex Accept-Language", () => {
    expect(detectBrowserLocale("fr-CA,es;q=0.8,en;q=0.7")).toBe("es");
  });
});

describe("i18n translation lookup", () => {
  it("renders Spanish strings", async () => {
    await expect(translateMessage("es", "navigation.settings")).resolves.toBe("Configuración");
  });

  it("falls back to English when locale is unsupported", async () => {
    await expect(translateMessage("fr", "navigation.settings")).resolves.toBe("Settings");
  });

  it("returns the key for missing translations", async () => {
    await expect(translateMessage("es", "missing.example")).resolves.toBe("missing.example");
  });
});
