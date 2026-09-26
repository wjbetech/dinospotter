import { expect, test } from "vite-plus/test";
import { taxonUrl, toTaxonDetail } from "../src/taxon.ts";

test("taxonUrl normalizes taxonomical prefixes", () => {
  expect(taxonUrl("txn:123")).toBe(taxonUrl("123"));
  expect(taxonUrl("123")).toContain("id=txn:123");
});

test("taxonUrl throws on abc", () => {
  expect(() => taxonUrl("abc")).toThrow("invalid taxonomical id!");
});

test("toTaxonDetail maps PBDB fields + pbdbUrl", () => {
  const details = toTaxonDetail({
    oid: "123",
    nam: "T. rex",
    rnk: "species",
    att: "Osborn 1905",
    par: "10",
    noc: 42,
  });

  expect(details.tid).toBe("123");
  expect(details.pbdbUrl).toBe("https://paleobiodb.org/classic/basicTaxonInfo?taxon_no=123");
});
