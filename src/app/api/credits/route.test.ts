import { describe, expect, test } from "vitest";
import { readCreditBalance } from "@/lib/credit-balance";

describe("readCreditBalance", () => {
  test("returns zero when profile has no balance value", () => {
    expect(readCreditBalance({ credit_balance: null })).toBe(0);
  });

  test("returns profile credit balance", () => {
    expect(readCreditBalance({ credit_balance: 2 })).toBe(2);
  });
});
