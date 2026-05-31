export type GenerationFailurePayload = {
  code: string;
  error: string;
};

export function messageFromUnknownError(error: unknown) {
  return error instanceof Error ? error.message : "Generation failed";
}

export function generationFailurePayload(error: unknown): GenerationFailurePayload {
  const message = messageFromUnknownError(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("billing hard limit") || normalized.includes("quota") || normalized.includes("insufficient_quota")) {
    return {
      code: "openai_billing_limit",
      error: "OpenAI 账户额度或支付上限已用尽，请到 OpenAI Billing 充值或提高上限后重试。"
    };
  }

  if (normalized.includes("connection error") || normalized.includes("connect timeout") || normalized.includes("fetch failed")) {
    return {
      code: "openai_connection_error",
      error: "连接 OpenAI 失败，请确认本地代理或网络可供 Node 服务使用后重试。"
    };
  }

  if (normalized.includes("model") || normalized.includes("does not exist") || normalized.includes("permission")) {
    return {
      code: "openai_model_error",
      error: "OpenAI 模型不可用或账号没有权限，请检查 OPENAI_IMAGE_MODEL 和模型权限。"
    };
  }

  return {
    code: "generation_failed",
    error: "生成失败，请检查 OpenAI 配置、模型权限或稍后重试。"
  };
}
