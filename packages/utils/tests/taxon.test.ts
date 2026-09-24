import { expect, test } from "vite-plus/test";
import { taxonUrl } from "../src/taxon.ts";

test("taxonUrl normalizes taxonomical prefixes", () => {
  expect(taxonUrl("txn:123")).toBe(taxonUrl("123"));
  expect(taxonUrl("123")).toContain("id=txn:123");
});

test("taxonUrl throws on abc", () => {
  expect(() => taxonUrl("abc")).toThrow("invalid taxonomical id!");
});
