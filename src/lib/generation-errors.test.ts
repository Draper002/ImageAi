import { describe, expect, test } from "vitest";
import { generationFailurePayload } from "./generation-errors";

describe("generationFailurePayload", () => {
  test("maps OpenAI billing limit errors to a clear user-facing message", () => {
    expect(generationFailurePayload(new Error("400 Billing hard limit has been reached."))).toEqual({
      code: "openai_billing_limit",
      error: "OpenAI 账户额度或支付上限已用尽，请到 OpenAI Billing 充值或提高上限后重试。"
    });
  });

  test("maps OpenAI connection errors to a proxy/network hint", () => {
    expect(generationFailurePayload(new Error("Connection error."))).toEqual({
      code: "openai_connection_error",
      error: "连接 OpenAI 失败，请确认本地代理或网络可供 Node 服务使用后重试。"
    });
  });
});
