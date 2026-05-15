import { describe, expect, test, vi } from "vitest";
import { refundGenerationCredit, reserveGenerationCredit } from "./credits";

describe("credits", () => {
  test("returns true when Supabase RPC reserves credit", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });

    await expect(reserveGenerationCredit({ rpc } as never, "user-1", "gen-1")).resolves.toBe(true);
    expect(rpc).toHaveBeenCalledWith("reserve_generation_credit", {
      p_user_id: "user-1",
      p_generation_id: "gen-1"
    });
  });

  test("throws when refund RPC fails", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: null, error: { message: "db down" } });

    await expect(refundGenerationCredit({ rpc } as never, "user-1", "gen-1")).rejects.toThrow("db down");
  });
});
